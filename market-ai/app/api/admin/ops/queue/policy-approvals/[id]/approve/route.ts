import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const approval = await db.queuePolicyApproval.findUnique({ where: { id } });
  if (!approval) return NextResponse.json({ error: "Approval not found" }, { status: 404 });
  if (approval.status !== "PENDING") return NextResponse.json({ error: "Approval already decided" }, { status: 400 });

  const payload = approval.requestPayload as any;
  const updatedPolicy = await db.queuePolicy.upsert({
    where: { queueKey: approval.queueKey },
    update: {
      failThreshold: payload.failThreshold,
      openMs: payload.openMs,
      alertWebhook: payload.alertWebhook,
      enabled: payload.enabled,
    },
    create: {
      queueKey: approval.queueKey,
      failThreshold: payload.failThreshold ?? 5,
      openMs: payload.openMs ?? 300000,
      alertWebhook: payload.alertWebhook ?? null,
      enabled: payload.enabled ?? true,
    },
  });

  const decided = await db.queuePolicyApproval.update({
    where: { id },
    data: { status: "APPROVED", approvedById: auth.user.id, decidedAt: new Date() },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "QUEUE_POLICY_APPROVED",
    targetType: "QueuePolicyApproval",
    targetId: decided.id,
    metadata: { queueKey: approval.queueKey, policy: updatedPolicy },
  });

  return NextResponse.json({ approval: decided, policy: updatedPolicy });
}
