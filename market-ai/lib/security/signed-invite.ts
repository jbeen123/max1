import crypto from "crypto";

const secret = () => process.env.INVITE_LINK_SECRET || process.env.AUDIT_CHAIN_SECRET || "invite-dev-secret";

export function signInviteToken(token: string, issuedAtMs: number) {
  const payload = `${token}.${issuedAtMs}`;
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function verifyInviteSignature(token: string, issuedAtMs: number, sig: string, maxAgeMs = 1000 * 60 * 60 * 24 * 14) {
  const now = Date.now();
  if (issuedAtMs > now + 60_000) return false;
  if (now - issuedAtMs > maxAgeMs) return false;

  const expected = signInviteToken(token, issuedAtMs);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig || "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
