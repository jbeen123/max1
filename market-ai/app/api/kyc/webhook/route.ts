import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  // Verify provider signature here and persist user verification state.
  return NextResponse.json({ received: true, bytes: body.length });
}
