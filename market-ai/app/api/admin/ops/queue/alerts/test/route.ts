import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { verifySignedWebhook } from "@/lib/security/webhook-verify";
import { getWebhookSigningKeys } from "@/lib/security/webhook-keys";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const bodyText = await req.text();
  const result = await verifySignedWebhook({
    scope: "queue-alert-test",
    bodyText,
    ts: req.headers.get("x-marketai-ts"),
    nonce: req.headers.get("x-marketai-nonce"),
    signature: req.headers.get("x-marketai-signature"),
    kid: req.headers.get("x-marketai-kid"),
    keyRing: getWebhookSigningKeys(),
    maxAgeMs: 5 * 60 * 1000,
  });

  if (!result.ok) return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  return NextResponse.json({ ok: true });
}
