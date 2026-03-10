import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { getEnvWebhookSigningKeys } from "@/lib/security/webhook-keys";

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const dbKeys = await db.webhookSigningKey.findMany({
    orderBy: { createdAt: "desc" },
    select: { kid: true, isActive: true, createdAt: true, revokedAt: true },
  });

  const envKeys = getEnvWebhookSigningKeys().map((k) => ({
    kid: k.kid,
    source: "env" as const,
    isActive: false,
    createdAt: null,
    revokedAt: null,
  }));

  return NextResponse.json({
    keys: [
      ...dbKeys.map((k) => ({ ...k, source: "db" as const })),
      ...envKeys,
    ],
  });
}

export async function POST() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const kid = `key_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const secret = crypto.randomBytes(32).toString("hex");

  // Deactivate all existing DB keys
  await db.webhookSigningKey.updateMany({ data: { isActive: false } });

  // Create and activate new key
  await db.webhookSigningKey.create({ data: { kid, secret, isActive: true } });

  // Return secret ONCE — not stored in plaintext elsewhere
  return NextResponse.json({ ok: true, kid, secret, warning: "Store this secret immediately — it will not be shown again." }, { status: 201 });
}
