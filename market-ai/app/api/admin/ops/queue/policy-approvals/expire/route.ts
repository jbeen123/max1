import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { isEdgeTrusted } from "@/lib/auth-edge";
import { acquireOpsLock, releaseOpsLock } from "@/lib/ops/lock";
import { expireStaleQueuePolicyApprovals } from "@/lib/queue/policy-approval-expiry";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok && !isEdgeTrusted(req)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const owner = auth.user?.id ?? "edge";
  const lockKey = "queue-policy-approval-expiry";
  const locked = await acquireOpsLock(lockKey, owner, 60_000);
  if (!locked) return NextResponse.json({ error: "Expiry job already running" }, { status: 409 });

  try {
    const expiredCount = await expireStaleQueuePolicyApprovals();

    await logAudit({
      actorId: auth.user?.id,
      action: "QUEUE_POLICY_APPROVALS_EXPIRED",
      targetType: "QueuePolicyApproval",
      targetId: "*",
      metadata: { expiredCount, trigger: auth.user ? "admin" : "edge", ranAt: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true, expiredCount, ranAt: new Date().toISOString() });
  } finally {
    await releaseOpsLock(lockKey, owner);
  }
}
