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

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "20")));
  const query = searchParams.get("q") || "";
  const skip = (page - 1) * pageSize;

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: { id: true, email: true, name: true, role: true, isVerified: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, users });
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  try {
    const input = patchSchema.parse(await req.json());
    const before = await db.user.findUnique({ where: { id: input.userId } });
    if (!before) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = await db.user.update({
      where: { id: input.userId },
      data: { role: input.role, isVerified: input.isVerified },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "ADMIN_USER_UPDATED",
      targetType: "User",
      targetId: updated.id,
      metadata: {
        before: { role: before.role, isVerified: before.isVerified },
        after: { role: updated.role, isVerified: updated.isVerified },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: String(error) }, { status: 400 });
  }
}
