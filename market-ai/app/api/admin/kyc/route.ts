import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const schema = z.object({
  sessionId: z.string().min(1),
  status: z.enum(["VERIFIED", "REJECTED"]),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const items = await db.kycSession.findMany({
    where: { status: "PENDING_REVIEW" },
    include: { user: { select: { id: true, email: true, role: true } } },
    take: 50,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = schema.parse(await req.json());
    const updated = await db.kycSession.update({
      where: { externalId: input.sessionId },
      data: { status: input.status },
    });

    if (input.status === "VERIFIED") {
      await db.user.update({ where: { id: updated.userId }, data: { isVerified: true } });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Invalid KYC admin payload", details: String(error) }, { status: 400 });
  }
}
