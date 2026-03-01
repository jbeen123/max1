import crypto from "crypto";

export function signJsonPayload(payload: unknown, secret: string) {
  const body = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}
