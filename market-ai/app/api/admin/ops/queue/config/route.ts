import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { canRequestQueuePolicy } from "@/lib/queue/policy-access";
import { computeApprovalExpiryDate, expireStaleQueuePolicyApprovals } from "@/lib/queue/policy-approval-expiry";

const schema = z.object({
  queueKey: z.string().default("ATTESTATION_UPLOAD"),
  failThreshold: z.number().int().min(1).max(100).optional(),
  openMs: z.number().int().min(1000).max(60 * 60 * 1000).optional(),
  alertWebhook: z.string().url().nullable().optional(),
  enabled: z.boolean().optional(),
  submitForApproval: z.boolean().default(true),
  note: z.string().optional(),
  requiredVotes: z.number().int().min(1).max(5).optional(),
});

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  await expireStaleQueuePolicyApprovals();

  const { searchParams } = new URL(req.url);
  const queueKey = searchParams.get("queueKey") || "ATTESTATION_UPLOAD";

  const [config, pendingApproval] = await Promise.all([
    db.queuePolicy.findUnique({ where: { queueKey } }),
    db.queuePolicyApproval.findFirst({ where: { queueKey, status: "PENDING" }, orderBy: { createdAt: "desc" }, include: { votes: true } }),
  ]);

  return NextResponse.json({ queueKey, config, pendingApproval });
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const input = schema.parse(await req.json());

  if (input.submitForApproval) {
    if (!canRequestQueuePolicy(auth.user)) {
      return NextResponse.json({ error: "Not authorized to request queue policy changes" }, { status: 403 });
    }

    const approval = await db.queuePolicyApproval.create({
      data: {
        queueKey: input.queueKey,
        requestedById: auth.user.id,
        status: "PENDING",
        requestPayload: input,
        note: input.note,
        requiredVotes: input.requiredVotes ?? Number(process.env.QUEUE_POLICY_REQUIRED_VOTES || "2"),
        expiresAt: computeApprovalExpiryDate(),
      },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "QUEUE_POLICY_APPROVAL_REQUESTED",
      targetType: "QueuePolicyApproval",
      targetId: approval.id,
      metadata: input,
    });

    return NextResponse.json({ queued: true, approvalId: approval.id }, { status: 202 });
  }

  const before = await db.queuePolicy.findUnique({ where: { queueKey: input.queueKey } });
  const updated = await db.queuePolicy.upsert({
    where: { queueKey: input.queueKey },
    update: {
      failThreshold: input.failThreshold,
      openMs: input.openMs,
      alertWebhook: input.alertWebhook,
      enabled: input.enabled,
    },
    create: {
      queueKey: input.queueKey,
      failThreshold: input.failThreshold ?? 5,
      openMs: input.openMs ?? 300000,
      alertWebhook: input.alertWebhook ?? null,
      enabled: input.enabled ?? true,
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "QUEUE_POLICY_UPDATED",
    targetType: "QueuePolicy",
    targetId: input.queueKey,
    metadata: { before, after: updated, bypassApproval: true },
  });

  return NextResponse.json(updated);
}
