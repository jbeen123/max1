type SigningKey = { kid: string; secret: string };

function parseKeyMapJson(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([k, v]) => typeof k === "string" && typeof v === "string" && k.trim() && v.trim())
        .map(([k, v]) => [k.trim(), v.trim()]),
    );
  } catch {
    return {};
  }
}

export function getWebhookSigningKeys(): SigningKey[] {
  const map = parseKeyMapJson(process.env.QUEUE_ALERT_SIGNING_KEYS_JSON);
  const keys: SigningKey[] = Object.entries(map).map(([kid, secret]) => ({ kid, secret }));

  if (process.env.QUEUE_ALERT_SIGNING_SECRET) {
    keys.push({ kid: "legacy", secret: process.env.QUEUE_ALERT_SIGNING_SECRET });
  }

  return keys;
}

export function getActiveWebhookSigningKey(): SigningKey | null {
  const keys = getWebhookSigningKeys();
  if (keys.length === 0) return null;

  const preferredKid = (process.env.QUEUE_ALERT_SIGNING_KEY_ID || "").trim();
  if (preferredKid) {
    const found = keys.find((k) => k.kid === preferredKid);
    if (found) return found;
  }

  return keys[0];
}
