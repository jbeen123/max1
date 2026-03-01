import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getRule } from "@/lib/compliance";
import { requireRole } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  state: z.string().min(2).max(2),
  county: z.string().min(2),
  askingPrice: z.coerce.number().int().positive(),
  lotSizeAcres: z.coerce.number().optional(),
  assignmentAllowed: z.coerce.boolean().optional().default(false),
});

export async function GET() {
  const data = await db.property.findMany({
    where: { status: { in: ["ACTIVE", "UNDER_CONTRACT", "ASSIGNED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole(["SELLER", "ADMIN"]);
    if (!auth.ok || !auth.user) {
      return NextResponse.json({ error: "Unauthorized. Login as seller/admin." }, { status: 401 });
    }

    const input = createSchema.parse(await req.json());
    const rule = getRule(input.state);

    const property = await db.property.create({
      data: {
        ...input,
        state: input.state.toUpperCase(),
        sellerId: auth.user.id,
        assignmentAllowed: rule.assignmentAllowed ? input.assignmentAllowed : false,
        disclosures: {
          complianceChecklist: rule.checklist,
          submittedAt: new Date().toISOString(),
        },
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: String(error) }, { status: 400 });
  }
}
