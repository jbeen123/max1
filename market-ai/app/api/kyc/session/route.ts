import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createKycProviderSession } from "@/lib/integrations/kyc";

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
    const created = await createKycProviderSession(input);

    const saved = await db.kycSession.create({
      data: {
        userId: input.userId,
        provider: mapProvider[input.provider],
        externalId: created.externalId,
        status: "PENDING_REVIEW",
        rawPayload: created.rawPayload,
      },
    });

    return NextResponse.json({
      sessionId: saved.externalId,
      provider: input.provider,
      status: saved.status,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid KYC payload", details: String(error) }, { status: 400 });
  }
}
