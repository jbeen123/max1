import crypto from "crypto";
import { db } from "@/lib/db";

export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: unknown;
}) {
  const previous = await db.auditLog.findFirst({ orderBy: { createdAt: "desc" } });
  const prevHash = previous?.hash ?? null;

  const payload = JSON.stringify({
    actorId: params.actorId ?? null,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    metadata: params.metadata ?? null,
    prevHash,
  });

  const secret = process.env.AUDIT_CHAIN_SECRET ?? "audit-dev-secret";
  const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  await db.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata as object | undefined,
      prevHash,
      hash,
    },
  });
}
