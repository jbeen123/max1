import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ kid: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { kid } = await params;
  const key = await db.webhookSigningKey.findUnique({ where: { kid } });
  if (!key) return NextResponse.json({ error: "Key not found" }, { status: 404 });
  if (key.revokedAt) return NextResponse.json({ error: "Cannot activate a revoked key" }, { status: 409 });

  await db.webhookSigningKey.updateMany({ data: { isActive: false } });
  await db.webhookSigningKey.update({ where: { kid }, data: { isActive: true } });

  return NextResponse.json({ ok: true, kid });
}
