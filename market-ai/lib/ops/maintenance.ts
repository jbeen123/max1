import { db } from "@/lib/db";

export async function pruneRateLimitEvents(keepHours = 72) {
  const cutoff = new Date(Date.now() - keepHours * 60 * 60 * 1000);
  const result = await db.rateLimitEvent.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return { deleted: result.count, keepHours };
}
