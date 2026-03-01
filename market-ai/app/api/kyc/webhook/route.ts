import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyHmacSha256 } from "@/lib/webhooks";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-kyc-signature");
  const secret = process.env.KYC_WEBHOOK_SECRET;

  if (!verifyHmacSha256(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload) as {
    sessionId?: string;
    status?: "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
    userId?: string;
  };

  if (!event.sessionId || !event.status) {
    return NextResponse.json({ error: "Malformed event" }, { status: 400 });
  }

  const updated = await db.kycSession.update({
    where: { externalId: event.sessionId },
    data: {
      status: event.status,
      rawPayload: event,
    },
    include: { user: true },
  });

  if (event.status === "VERIFIED") {
    await db.user.update({ where: { id: updated.userId }, data: { isVerified: true } });
  }

  return NextResponse.json({ received: true, sessionId: updated.externalId, status: updated.status });
}
