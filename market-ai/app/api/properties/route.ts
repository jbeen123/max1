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

  // Public seller/profile fields
  sellerDisplayName: z.string().optional(),
  sellerPublicContact: z.string().optional(),

  // Public land fields
  city: z.string().optional(),
  zipCode: z.string().optional(),
  annualTaxes: z.coerce.number().optional(),
  hoa: z.string().optional(),
  roadAccess: z.string().optional(),
  utilities: z.string().optional(),
  floodZone: z.string().optional(),
  parcelId: z.string().optional(),
  zoning: z.string().optional(),
});

export async function GET() {
  const data = await db.property.findMany({
    where: { status: { in: ["ACTIVE", "UNDER_CONTRACT", "ASSIGNED"] } },
    include: {
      seller: { select: { id: true, name: true, role: true, isVerified: true, state: true } },
    },
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
        title: input.title,
        description: input.description,
        state: input.state.toUpperCase(),
        county: input.county,
        askingPrice: input.askingPrice,
        lotSizeAcres: input.lotSizeAcres,
        parcelId: input.parcelId,
        zoning: input.zoning,
        sellerId: auth.user.id,
        assignmentAllowed: rule.assignmentAllowed ? input.assignmentAllowed : false,
        disclosures: {
          complianceChecklist: rule.checklist,
          submittedAt: new Date().toISOString(),
          publicInfo: {
            seller: {
              displayName: input.sellerDisplayName || auth.user.name || null,
              publicContact: input.sellerPublicContact || null,
              role: auth.user.role,
              verified: auth.user.isVerified,
              state: auth.user.state,
            },
            land: {
              city: input.city || null,
              zipCode: input.zipCode || null,
              annualTaxes: input.annualTaxes || null,
              hoa: input.hoa || null,
              roadAccess: input.roadAccess || null,
              utilities: input.utilities || null,
              floodZone: input.floodZone || null,
            },
          },
        },
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: String(error) }, { status: 400 });
  }
}
