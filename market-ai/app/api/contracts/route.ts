import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  getTemplate,
  buildContract,
  type TemplateVariables,
} from "@/lib/contracts/templates";
import { checkCompliance } from "@/lib/contracts/compliance-check";

export const dynamic = "force-dynamic";

/** GET /api/contracts - List user's contracts */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await db.generatedContract.findMany({
    where: {
      OR: [
        { buyerId: user.id },
        { sellerId: user.id },
      ],
    },
    include: { template: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ contracts });
}

/** POST /api/contracts - Generate and save a contract */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    templateId,
    propertyId,
    buyerId,
    sellerId,
    variables,
    selectedClauseIds,
    isPreBuilt1978,
  } = body as {
    templateId: string;
    propertyId?: string;
    buyerId?: string;
    sellerId?: string;
    variables: TemplateVariables;
    selectedClauseIds: string[];
    isPreBuilt1978?: boolean;
  };

  if (!templateId || !variables || !selectedClauseIds) {
    return NextResponse.json(
      { error: "templateId, variables, and selectedClauseIds are required" },
      { status: 400 }
    );
  }

  // Check if we have a DB template or fall back to built-in
  let dbTemplate = await db.contractTemplate.findFirst({
    where: { id: templateId, isActive: true },
  });

  // Try built-in templates
  const builtIn = getTemplate(templateId);
  if (!dbTemplate && !builtIn) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Run compliance check
  const compliance = checkCompliance({
    state: variables.state ?? "",
    contractType: (dbTemplate?.type ?? builtIn?.type) as any,
    variables: variables as any,
    selectedClauseIds,
    isPreBuilt1978: isPreBuilt1978 ?? false,
  });

  // Build final content
  let finalContent: string;
  if (builtIn) {
    finalContent = buildContract(builtIn, selectedClauseIds, variables);
  } else {
    // DB template – simple interpolation
    const { interpolate } = await import("@/lib/contracts/templates");
    finalContent = interpolate(dbTemplate!.content, variables as any);
  }

  // Ensure a DB template record exists
  let templateRecord = dbTemplate;
  if (!templateRecord && builtIn) {
    templateRecord = await db.contractTemplate.upsert({
      where: { id: builtIn.id },
      create: {
        id: builtIn.id,
        name: builtIn.name,
        type: builtIn.type,
        content: finalContent,
        clauses: builtIn.defaultClauses as any,
        isActive: true,
      },
      update: {},
    });
  }

  const contract = await db.generatedContract.create({
    data: {
      templateId: templateRecord!.id,
      propertyId: propertyId ?? null,
      buyerId: buyerId ?? user.id,
      sellerId: sellerId ?? null,
      variables: variables as any,
      finalContent,
      status: "DRAFT",
    },
  });

  return NextResponse.json({
    contract,
    compliance,
    message: compliance.passed
      ? "Contract generated successfully."
      : "Contract generated with compliance warnings. Review before use.",
  });
}
