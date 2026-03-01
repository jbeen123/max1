import { db } from "@/lib/db";

export async function ensureWebhookNotProcessed(source: string, eventKey: string, eventType?: string, payload?: unknown) {
  try {
    await db.webhookEvent.create({
      data: {
        source,
        eventKey,
        eventType,
        payload: payload as object | undefined,
      },
    });
    return { duplicate: false as const };
  } catch {
    return { duplicate: true as const };
  }
}
