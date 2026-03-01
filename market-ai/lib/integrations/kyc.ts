import crypto from "crypto";

type KycInput = {
  provider: "persona" | "stripe_identity" | "sumsub";
  userId: string;
};

export async function createKycProviderSession(input: KycInput) {
  if (input.provider === "persona" && process.env.PERSONA_API_KEY) {
    return {
      externalId: `persona_sess_${crypto.randomUUID().slice(0, 12)}`,
      rawPayload: { mode: "persona_stub", input },
    };
  }

  if (input.provider === "sumsub" && process.env.SUMSUB_APP_TOKEN && process.env.SUMSUB_SECRET_KEY) {
    return {
      externalId: `sumsub_sess_${crypto.randomUUID().slice(0, 12)}`,
      rawPayload: { mode: "sumsub_stub", input },
    };
  }

  if (input.provider === "stripe_identity" && process.env.STRIPE_SECRET_KEY) {
    return {
      externalId: `stripe_identity_sess_${crypto.randomUUID().slice(0, 12)}`,
      rawPayload: { mode: "stripe_identity_stub", input },
    };
  }

  return {
    externalId: `${input.provider}_sess_${crypto.randomUUID().slice(0, 12)}`,
    rawPayload: { mode: "mock", input },
  };
}
