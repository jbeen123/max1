import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const schema = z.object({
  propertyId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
  currency: z.string().min(3).default("usd"),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({
        intentId: `pi_mock_${crypto.randomUUID().slice(0, 12)}`,
        clientSecret: "mock_client_secret",
        mode: "mock",
        note: "Set STRIPE_SECRET_KEY for live PaymentIntent creation.",
      });
    }

    const stripe = new Stripe(key);
    const intent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        propertyId: input.propertyId,
        flow: "earnest_money",
      },
    });

    return NextResponse.json({
      intentId: intent.id,
      clientSecret: intent.client_secret,
      mode: "live",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payment payload", details: String(error) }, { status: 400 });
  }
}
