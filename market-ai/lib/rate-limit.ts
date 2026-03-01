import { db } from "@/lib/db";

export async function checkRateLimit(params: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  const since = new Date(Date.now() - params.windowMs);
  const count = await db.rateLimitEvent.count({
    where: { scope: params.scope, key: params.key, createdAt: { gte: since } },
  });

  if (count >= params.limit) {
    return { ok: false as const, remaining: 0 };
  }

  await db.rateLimitEvent.create({ data: { scope: params.scope, key: params.key } });
  return { ok: true as const, remaining: Math.max(0, params.limit - count - 1) };
}
