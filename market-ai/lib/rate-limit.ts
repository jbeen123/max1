import { db } from "@/lib/db";

// Rate limiting disabled for MVP - no rateLimitEvent model in schema
export async function checkRateLimit(params: {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}) {
  // TODO: Re-enable when rateLimitEvent model is added
  return { ok: true as const, remaining: params.limit };
}
