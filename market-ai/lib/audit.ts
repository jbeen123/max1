import crypto from "crypto";

// Audit logging disabled for MVP - no auditLog model in schema
export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: unknown;
}) {
  // TODO: Re-enable when auditLog model is added
  console.log("Audit log:", params);
  return;
}
