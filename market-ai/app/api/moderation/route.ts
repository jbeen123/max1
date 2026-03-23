import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  propertyId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
  moderationNotes: z.string().optional(),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const queue = await db.property.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: { seller: { select: { email: true, name: true } } },
  });
  return NextResponse.json(queue);
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = schema.parse(await req.json());
    const updated = await db.property.update({
      where: { id: input.propertyId },
      data: {
        status: input.action === "APPROVE" ? "ACTIVE" : "ARCHIVED",
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Invalid moderation payload", details: String(error) }, { status: 400 });
  }
}
