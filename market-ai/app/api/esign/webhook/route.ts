import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyHmacSha256 } from "@/lib/webhooks";
import { ensureWebhookNotProcessed } from "@/lib/webhook-idempotency";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-esign-signature");
  const secret = process.env.ESIGN_WEBHOOK_SECRET;

  if (!verifyHmacSha256(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    eventId?: string;
    envelopeId?: string;
    status?: "SENT" | "COMPLETED" | "DECLINED" | "VOIDED";
  };

  if (!event.envelopeId || !event.status) {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  const eventKey = event.eventId ?? `${event.envelopeId}:${event.status}`;
  const idemp = await ensureWebhookNotProcessed("esign", eventKey, "esign.status", event);
  if (idemp.duplicate) return NextResponse.json({ received: true, duplicate: true });

  const eventPayload = JSON.parse(JSON.stringify(event));
  const updated = await db.eSignEnvelope.update({
    where: { externalId: event.envelopeId },
    data: { status: event.status, rawPayload: eventPayload },
  });

  if (event.status === "COMPLETED") {
    await db.property.updateMany({ where: { id: updated.propertyId, status: "ACTIVE" }, data: { status: "UNDER_CONTRACT" } });
  }

  await logAudit({ action: `ESIGN_${event.status}`, targetType: "ESignEnvelope", targetId: updated.externalId, metadata: { propertyId: updated.propertyId } });

  return NextResponse.json({ received: true, envelopeId: updated.externalId, status: updated.status });
}
