import { db } from "@/lib/db";

export async function getQueuePolicy(queueKey: string) {
  const existing = await db.queuePolicy.findUnique({ where: { queueKey } });
  if (existing) return existing;

  return db.queuePolicy.create({
    data: {
      queueKey,
      failThreshold: Number(process.env.QUEUE_CIRCUIT_FAIL_THRESHOLD || "5"),
      openMs: Number(process.env.QUEUE_CIRCUIT_OPEN_MS || "300000"),
      alertWebhook: process.env.QUEUE_ALERT_WEBHOOK_URL || null,
      enabled: true,
    },
  });
}
