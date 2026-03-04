import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ userId: z.string().min(1), email: z.string().email().optional() });

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());
    const key = process.env.STRIPE_SECRET_KEY;

    if (!key) {
      const accountId = `acct_mock_${crypto.randomUUID().slice(0, 12)}`;
      const saved = await db.payoutAccount.upsert({
        where: { userId: input.userId },
        update: { stripeAccountId: accountId, detailsSubmitted: true },
        create: {
          userId: input.userId,
          stripeAccountId: accountId,
          detailsSubmitted: true,
          chargesEnabled: false,
          payoutsEnabled: false,
          rawPayload: { mode: "mock" },
        },
      });
      return NextResponse.json({ accountId: saved.stripeAccountId, mode: "mock" });
    }

    const stripe = new Stripe(key);
    const account = await stripe.accounts.create({
      type: "express",
      email: input.email,
      capabilities: { transfers: { requested: true } },
    });

    const accountPayload = JSON.parse(JSON.stringify(account));

    await db.payoutAccount.upsert({
      where: { userId: input.userId },
      update: {
        stripeAccountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        rawPayload: accountPayload,
      },
      create: {
        userId: input.userId,
        stripeAccountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        rawPayload: accountPayload,
      },
    });

    return NextResponse.json({ accountId: account.id, mode: "live" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid connect account payload", details: String(error) }, { status: 400 });
  }
}
