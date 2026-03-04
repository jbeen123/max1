import crypto from "crypto";
import { db } from "@/lib/db";
import { signWebhookEnvelope } from "@/lib/security/webhook-signing";

export async function verifySignedWebhook(params: {
  scope: string;
  bodyText: string;
  ts: string | null;
  nonce: string | null;
  signature: string | null;
  kid?: string | null;
  secret?: string | undefined;
  keyRing?: Array<{ kid: string; secret: string }>;
  maxAgeMs?: number;
}) {
  const maxAge = params.maxAgeMs ?? 5 * 60 * 1000;
  if (!params.ts || !params.nonce || !params.signature) return { ok: false, reason: "missing_signature_parts" } as const;

  const tsNum = Number(params.ts);
  if (!Number.isFinite(tsNum)) return { ok: false, reason: "invalid_timestamp" } as const;
  if (Math.abs(Date.now() - tsNum) > maxAge) return { ok: false, reason: "timestamp_out_of_window" } as const;

  const parsed = JSON.parse(params.bodyText);

  const keys = (params.keyRing && params.keyRing.length > 0)
    ? params.keyRing
    : (params.secret ? [{ kid: params.kid || "legacy", secret: params.secret }] : []);

  if (keys.length === 0) return { ok: false, reason: "missing_signature_parts" } as const;

  const candidateKeys = params.kid ? keys.filter((k) => k.kid === params.kid) : keys;
  if (params.kid && candidateKeys.length === 0) return { ok: false, reason: "unknown_kid" } as const;

  let signatureOk = false;
  for (const key of candidateKeys) {
    const expected = signWebhookEnvelope(parsed, params.ts, params.nonce, key.secret);
    const a = Buffer.from(expected);
    const b = Buffer.from(params.signature);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      signatureOk = true;
      break;
    }
  }

  if (!signatureOk) return { ok: false, reason: "bad_signature" } as const;

  try {
    await db.webhookNonceUse.create({ data: { scope: params.scope, nonce: params.nonce } });
  } catch {
    return { ok: false, reason: "replay_detected" } as const;
  }

  return { ok: true } as const;
}
