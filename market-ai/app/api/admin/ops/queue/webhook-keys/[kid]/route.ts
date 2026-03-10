import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ kid: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { kid } = await params;
  const key = await db.webhookSigningKey.findUnique({ where: { kid } });
  if (!key) return NextResponse.json({ error: "Key not found" }, { status: 404 });
  if (key.revokedAt) return NextResponse.json({ error: "Already revoked" }, { status: 409 });

  await db.webhookSigningKey.update({
    where: { kid },
    data: { revokedAt: new Date(), isActive: false },
  });

  return NextResponse.json({ ok: true });
}
