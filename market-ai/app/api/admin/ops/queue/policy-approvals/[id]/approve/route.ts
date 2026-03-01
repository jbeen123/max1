import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const approval = await db.queuePolicyApproval.findUnique({ where: { id }, include: { votes: true } });
  if (!approval) return NextResponse.json({ error: "Approval not found" }, { status: 404 });
  if (approval.status !== "PENDING") return NextResponse.json({ error: "Approval already decided" }, { status: 400 });
  if (approval.requestedById && approval.requestedById === auth.user.id) {
    return NextResponse.json({ error: "Requester cannot self-approve" }, { status: 403 });
  }

  try {
    await db.queuePolicyApprovalVote.create({ data: { approvalId: id, voterId: auth.user.id } });
  } catch {
    return NextResponse.json({ error: "Already voted" }, { status: 400 });
  }

  const refreshed = await db.queuePolicyApproval.findUnique({ where: { id }, include: { votes: true } });
  if (!refreshed) return NextResponse.json({ error: "Approval missing" }, { status: 404 });

  const voteCount = refreshed.votes.length;
  const required = refreshed.requiredVotes;

  if (voteCount >= required) {
    const payload = refreshed.requestPayload as any;
    const updatedPolicy = await db.queuePolicy.upsert({
      where: { queueKey: refreshed.queueKey },
      update: {
        failThreshold: payload.failThreshold,
        openMs: payload.openMs,
        alertWebhook: payload.alertWebhook,
        enabled: payload.enabled,
      },
      create: {
        queueKey: refreshed.queueKey,
        failThreshold: payload.failThreshold ?? 5,
        openMs: payload.openMs ?? 300000,
        alertWebhook: payload.alertWebhook ?? null,
        enabled: payload.enabled ?? true,
      },
    });

    const decided = await db.queuePolicyApproval.update({
      where: { id },
      data: { status: "APPROVED", approvedById: auth.user.id, decidedAt: new Date() },
      include: { votes: true },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "QUEUE_POLICY_APPROVED",
      targetType: "QueuePolicyApproval",
      targetId: decided.id,
      metadata: { queueKey: refreshed.queueKey, policy: updatedPolicy, votes: voteCount, required },
    });

    return NextResponse.json({ approval: decided, policy: updatedPolicy, quorumReached: true });
  }

  await logAudit({
    actorId: auth.user.id,
    action: "QUEUE_POLICY_APPROVAL_VOTED",
    targetType: "QueuePolicyApproval",
    targetId: refreshed.id,
    metadata: { votes: voteCount, required },
  });

  return NextResponse.json({ approval: refreshed, quorumReached: false, votes: voteCount, required });
}
