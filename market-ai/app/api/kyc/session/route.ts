import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  userId: z.string().min(1),
  provider: z.enum(["persona", "stripe_identity", "sumsub"]),
});

const mapProvider = {
  persona: "PERSONA",
  stripe_identity: "STRIPE_IDENTITY",
  sumsub: "SUMSUB",
} as const;

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());

    // Integration hook: call provider SDK/API here.
    const sessionId = `${input.provider}_sess_${crypto.randomUUID().slice(0, 12)}`;

    const saved = await db.kycSession.create({
      data: {
        userId: input.userId,
        provider: mapProvider[input.provider],
        externalId: sessionId,
        status: "PENDING_REVIEW",
        rawPayload: { provider: input.provider, createdBy: "api" },
      },
    });

    return NextResponse.json({
      sessionId: saved.externalId,
      provider: input.provider,
      status: saved.status,
      note: "Provider call is scaffolded. Add real API credentials + SDK wiring.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid KYC payload", details: String(error) }, { status: 400 });
  }
}
