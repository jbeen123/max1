import { db } from "@/lib/db";

export async function acquireOpsLock(key: string, owner: string, ttlMs = 60_000) {
  const now = new Date();
  const until = new Date(Date.now() + ttlMs);

  const existing = await db.opsLock.findUnique({ where: { key } });
  if (!existing) {
    await db.opsLock.create({ data: { key, owner, lockedUntil: until } });
    return true;
  }

  if (existing.lockedUntil > now) return false;

  await db.opsLock.update({ where: { key }, data: { owner, lockedUntil: until } });
  return true;
}

export async function releaseOpsLock(key: string, owner: string) {
  const existing = await db.opsLock.findUnique({ where: { key } });
  if (!existing || existing.owner !== owner) return;
  await db.opsLock.update({ where: { key }, data: { lockedUntil: new Date(0) } });
}
