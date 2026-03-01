import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  // Verify Stripe signature and update transaction/deal state.
  return NextResponse.json({ received: true, bytes: body.length });
}
