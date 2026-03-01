import crypto from "crypto";

export function verifyHmacSha256(payload: string, signature: string | null, secret: string | undefined) {
  if (!signature || !secret) return false;
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const provided = signature.replace(/^sha256=/, "");
  const expectedBuf = Buffer.from(digest);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}
