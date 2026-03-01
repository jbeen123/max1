import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  provider: z.enum(["persona", "stripe_identity", "sumsub"]),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());

    // Integration hook: call provider SDK/API here.
    const sessionId = `${input.provider}_sess_${crypto.randomUUID().slice(0, 12)}`;

    return NextResponse.json({
      sessionId,
      provider: input.provider,
      status: "PENDING_REVIEW",
      note: "Provider call is scaffolded. Add real API credentials + SDK wiring.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid KYC payload", details: String(error) }, { status: 400 });
  }
}
