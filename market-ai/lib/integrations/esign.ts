import crypto from "crypto";

type EnvelopeInput = {
  provider: "docusign" | "dropbox_sign";
  propertyId: string;
  buyerEmail: string;
  sellerEmail: string;
};

export async function createEnvelope(input: EnvelopeInput) {
  if (input.provider === "docusign" && process.env.DOCUSIGN_INTEGRATION_KEY) {
    // TODO: Replace with real DocuSign SDK integration.
    return {
      externalId: `docusign_env_${crypto.randomUUID().slice(0, 12)}`,
      signingUrl: "https://apps.docusign.com/signing/mock",
      rawPayload: { mode: "docusign_stub", input },
    };
  }

  if (input.provider === "dropbox_sign" && process.env.DROPBOX_SIGN_API_KEY) {
    // TODO: Replace with real Dropbox Sign SDK integration.
    return {
      externalId: `dropbox_sign_env_${crypto.randomUUID().slice(0, 12)}`,
      signingUrl: "https://app.hellosign.com/editor/mock",
      rawPayload: { mode: "dropbox_sign_stub", input },
    };
  }

  return {
    externalId: `${input.provider}_env_${crypto.randomUUID().slice(0, 12)}`,
    signingUrl: `https://sign.market.ai/${input.provider}`,
    rawPayload: { mode: "mock", input },
  };
}
