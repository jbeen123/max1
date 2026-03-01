import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  propertyId: z.string().min(1),
  buyerEmail: z.string().email(),
  sellerEmail: z.string().email(),
  provider: z.enum(["docusign", "dropbox_sign"]).default("docusign"),
});

export async function POST(req: Request) {
  try {
    const input = schema.parse(await req.json());

    // Integration hook: replace with DocuSign / Dropbox Sign SDK calls.
    const envelopeId = `${input.provider}_env_${crypto.randomUUID().slice(0, 12)}`;

    return NextResponse.json({
      envelopeId,
      provider: input.provider,
      propertyId: input.propertyId,
      signers: [input.buyerEmail, input.sellerEmail],
      status: "SENT",
      note: "Scaffold response. Wire provider credentials and template mapping.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid envelope payload", details: String(error) }, { status: 400 });
  }
}
