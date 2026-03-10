import { db } from "@/lib/db";

export type SigningKey = { kid: string; secret: string };

// ── Env-based helpers (static, no DB) ────────────────────────────────────

function parseKeyMapJson(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const entries = Object.entries(parsed as Record<string, unknown>)
      .filter((entry): entry is [string, string] => {
        const [k, v] = entry;
        return typeof k === "string" && typeof v === "string" && k.trim().length > 0 && v.trim().length > 0;
      })
      .map(([k, v]) => [k.trim(), v.trim()] as const);
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export function getEnvWebhookSigningKeys(): SigningKey[] {
  const map = parseKeyMapJson(process.env.QUEUE_ALERT_SIGNING_KEYS_JSON);
  const keys: SigningKey[] = Object.entries(map).map(([kid, secret]) => ({ kid, secret }));
  if (process.env.QUEUE_ALERT_SIGNING_SECRET) {
    keys.push({ kid: "legacy", secret: process.env.QUEUE_ALERT_SIGNING_SECRET });
  }
  return keys;
}

// ── DB-backed helpers ─────────────────────────────────────────────────────

export async function getDbWebhookSigningKeys(): Promise<SigningKey[]> {
  const rows = await db.webhookSigningKey.findMany({
    where: { revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({ kid: r.kid, secret: r.secret }));
}

export async function getActiveDbWebhookSigningKey(): Promise<SigningKey | null> {
  const active = await db.webhookSigningKey.findFirst({
    where: { isActive: true, revokedAt: null },
  });
  if (active) return { kid: active.kid, secret: active.secret };

  // Fall back to most recent non-revoked DB key
  const latest = await db.webhookSigningKey.findFirst({
    where: { revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return latest ? { kid: latest.kid, secret: latest.secret } : null;
}

// ── Combined (DB preferred, env fallback) ────────────────────────────────

export async function getAllSigningKeys(): Promise<SigningKey[]> {
  const dbKeys = await getDbWebhookSigningKeys();
  if (dbKeys.length > 0) return dbKeys;
  return getEnvWebhookSigningKeys();
}

export async function getActiveSigningKey(): Promise<SigningKey | null> {
  const dbKey = await getActiveDbWebhookSigningKey();
  if (dbKey) return dbKey;

  // Env fallback
  const envKeys = getEnvWebhookSigningKeys();
  if (envKeys.length === 0) return null;
  const preferredKid = (process.env.QUEUE_ALERT_SIGNING_KEY_ID || "").trim();
  if (preferredKid) {
    const found = envKeys.find((k) => k.kid === preferredKid);
    if (found) return found;
  }
  return envKeys[0];
}

// ── Legacy sync exports (env-only, used by non-async contexts) ────────────

export function getWebhookSigningKeys(): SigningKey[] {
  return getEnvWebhookSigningKeys();
}

export function getActiveWebhookSigningKey(): SigningKey | null {
  const keys = getEnvWebhookSigningKeys();
  if (keys.length === 0) return null;
  const preferredKid = (process.env.QUEUE_ALERT_SIGNING_KEY_ID || "").trim();
  if (preferredKid) {
    const found = keys.find((k) => k.kid === preferredKid);
    if (found) return found;
  }
  return keys[0];
}
