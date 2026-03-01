import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const patchSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["BUYER", "SELLER", "ADMIN"]).optional(),
  isVerified: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = patchSchema.parse(await req.json());
    const updated = await db.user.update({
      where: { id: input.userId },
      data: {
        role: input.role,
        isVerified: input.isVerified,
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "ADMIN_USER_UPDATED",
      targetType: "User",
      targetId: updated.id,
      metadata: { role: input.role, isVerified: input.isVerified },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: String(error) }, { status: 400 });
  }
}
