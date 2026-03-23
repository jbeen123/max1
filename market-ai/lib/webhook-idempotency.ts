// Webhook idempotency disabled for MVP - no webhookEvent model in schema

export async function ensureWebhookNotProcessed(source: string, eventKey: string, eventType?: string, payload?: unknown) {
  // TODO: Re-enable when webhookEvent model is added
  return { duplicate: false as const };
}
