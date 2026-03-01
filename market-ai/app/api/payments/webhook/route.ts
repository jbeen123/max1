import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!key || !secret || !signature) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(key);
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await db.dealTransaction.updateMany({
        where: { stripeIntentId: intent.id },
        data: {
          status: "SUCCEEDED",
          rawPayload: intent,
        },
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await db.dealTransaction.updateMany({
        where: { stripeIntentId: intent.id },
        data: {
          status: "FAILED",
          rawPayload: intent,
        },
      });
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook", details: String(error) }, { status: 400 });
  }
}
