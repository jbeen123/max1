import crypto from "crypto";

export function signJsonPayload(payload: unknown, secret: string) {
  const body = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export function signWebhookEnvelope(payload: unknown, timestamp: string, nonce: string, secret: string) {
  const body = JSON.stringify(payload);
  const base = `${timestamp}.${nonce}.${body}`;
  return crypto.createHmac("sha256", secret).update(base).digest("hex");
}
