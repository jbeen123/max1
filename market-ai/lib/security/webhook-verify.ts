import crypto from "crypto";
import { db } from "@/lib/db";
import { signWebhookEnvelope } from "@/lib/security/webhook-signing";

export async function verifySignedWebhook(params: {
  scope: string;
  bodyText: string;
  ts: string | null;
  nonce: string | null;
  signature: string | null;
  secret: string | undefined;
  maxAgeMs?: number;
}) {
  const maxAge = params.maxAgeMs ?? 5 * 60 * 1000;
  if (!params.secret || !params.ts || !params.nonce || !params.signature) return { ok: false, reason: "missing_signature_parts" } as const;

  const tsNum = Number(params.ts);
  if (!Number.isFinite(tsNum)) return { ok: false, reason: "invalid_timestamp" } as const;
  if (Math.abs(Date.now() - tsNum) > maxAge) return { ok: false, reason: "timestamp_out_of_window" } as const;

  const parsed = JSON.parse(params.bodyText);
  const expected = signWebhookEnvelope(parsed, params.ts, params.nonce, params.secret);

  const a = Buffer.from(expected);
  const b = Buffer.from(params.signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false, reason: "bad_signature" } as const;

  try {
    await db.webhookNonceUse.create({ data: { scope: params.scope, nonce: params.nonce } });
  } catch {
    return { ok: false, reason: "replay_detected" } as const;
  }

  return { ok: true } as const;
}
