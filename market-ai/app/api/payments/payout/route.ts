import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  propertyId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
  currency: z.string().min(3).default("usd"),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const key = process.env.STRIPE_SECRET_KEY;
    const acct = await db.payoutAccount.findUnique({ where: { userId: input.userId } });

    if (!acct) return NextResponse.json({ error: "No payout account for user" }, { status: 404 });

    if (!key) {
      const saved = await db.payout.create({
        data: {
          propertyId: input.propertyId,
          userId: input.userId,
          stripePayoutId: `po_mock_${crypto.randomUUID().slice(0, 12)}`,
          amount: input.amount,
          currency: input.currency,
          status: "IN_TRANSIT",
          rawPayload: { mode: "mock" },
        },
      });
      return NextResponse.json({ payoutId: saved.id, stripePayoutId: saved.stripePayoutId, mode: "mock" });
    }

    const stripe = new Stripe(key);
    const transfer = await stripe.transfers.create({
      amount: input.amount,
      currency: input.currency.toLowerCase(),
      destination: acct.stripeAccountId,
      metadata: { propertyId: input.propertyId, flow: "seller_payout" },
    });

    const saved = await db.payout.create({
      data: {
        propertyId: input.propertyId,
        userId: input.userId,
        stripePayoutId: transfer.id,
        amount: input.amount,
        currency: input.currency.toLowerCase(),
        status: "IN_TRANSIT",
        rawPayload: transfer,
      },
    });

    return NextResponse.json({ payoutId: saved.id, stripePayoutId: transfer.id, mode: "live" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payout payload", details: String(error) }, { status: 400 });
  }
}
