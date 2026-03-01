import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  propertyId: z.string().min(1),
  buyerEmail: z.string().email(),
  sellerEmail: z.string().email(),
  provider: z.enum(["docusign", "dropbox_sign"]).default("docusign"),
});

const mapProvider = {
  docusign: "DOCUSIGN",
  dropbox_sign: "DROPBOX_SIGN",
} as const;

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());

    // Integration hook: replace with DocuSign / Dropbox Sign SDK calls.
    const envelopeId = `${input.provider}_env_${crypto.randomUUID().slice(0, 12)}`;
    const signingUrl = `https://sign.market.ai/${envelopeId}`;

    const saved = await db.eSignEnvelope.create({
      data: {
        propertyId: input.propertyId,
        provider: mapProvider[input.provider],
        externalId: envelopeId,
        buyerEmail: input.buyerEmail,
        sellerEmail: input.sellerEmail,
        status: "SENT",
        signingUrl,
        rawPayload: input,
      },
    });

    return NextResponse.json({
      envelopeId: saved.externalId,
      provider: input.provider,
      propertyId: input.propertyId,
      signers: [input.buyerEmail, input.sellerEmail],
      status: saved.status,
      signingUrl: saved.signingUrl,
      note: "Scaffold response. Wire provider credentials + template mapping.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid envelope payload", details: String(error) }, { status: 400 });
  }
}
