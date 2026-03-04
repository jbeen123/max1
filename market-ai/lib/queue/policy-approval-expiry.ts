import { db } from "@/lib/db";

export function getQueuePolicyApprovalTtlHours() {
  const raw = Number(process.env.QUEUE_POLICY_APPROVAL_TTL_HOURS || "24");
  if (!Number.isFinite(raw)) return 24;
  return Math.min(24 * 30, Math.max(1, Math.floor(raw)));
}

export function computeApprovalExpiryDate(now = new Date()) {
  const ttlHours = getQueuePolicyApprovalTtlHours();
  return new Date(now.getTime() + ttlHours * 60 * 60 * 1000);
}

export async function expireStaleQueuePolicyApprovals(now = new Date()) {
  const result = await db.queuePolicyApproval.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    data: {
      status: "REJECTED",
      decidedAt: now,
      note: "Expired automatically (stale pending approval)",
    },
  });

  return result.count;
}
