import crypto from "crypto";
import { signWebhookEnvelope } from "@/lib/security/webhook-signing";

export async function sendQueueAlert(params: {
  queueKey: string;
  message: string;
  webhookUrl?: string | null;
}) {
  const url = params.webhookUrl || process.env.QUEUE_ALERT_WEBHOOK_URL;
  if (!url) return { sent: false, reason: "no_webhook" } as const;

  const payload = {
    text: `[market.ai] queue alert (${params.queueKey}): ${params.message}`,
    queueKey: params.queueKey,
    message: params.message,
    at: new Date().toISOString(),
  };

  const secret = process.env.QUEUE_ALERT_SIGNING_SECRET || "";
  const ts = String(Date.now());
  const nonce = crypto.randomUUID();
  const signature = secret ? signWebhookEnvelope(payload, ts, nonce, secret) : undefined;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-marketai-ts": ts,
      "x-marketai-nonce": nonce,
      ...(signature ? { "x-marketai-signature": signature } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return { sent: false, reason: text } as const;
  }

  return { sent: true, signed: !!signature, ts, nonce } as const;
}
