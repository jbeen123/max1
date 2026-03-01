import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyHmacSha256 } from "@/lib/webhooks";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-esign-signature");
  const secret = process.env.ESIGN_WEBHOOK_SECRET;

  if (!verifyHmacSha256(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    envelopeId?: string;
    status?: "SENT" | "COMPLETED" | "DECLINED" | "VOIDED";
  };

  if (!event.envelopeId || !event.status) {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  const updated = await db.eSignEnvelope.update({
    where: { externalId: event.envelopeId },
    data: { status: event.status, rawPayload: event },
  });

  if (event.status === "COMPLETED") {
    await db.property.updateMany({
      where: { id: updated.propertyId, status: "ACTIVE" },
      data: { status: "UNDER_CONTRACT" },
    });
  }

  return NextResponse.json({ received: true, envelopeId: updated.externalId, status: updated.status });
}
