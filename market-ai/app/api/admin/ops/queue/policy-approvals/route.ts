import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  queueKey: z.string().default("ATTESTATION_UPLOAD"),
  failThreshold: z.number().int().min(1).max(100).optional(),
  openMs: z.number().int().min(1000).max(60 * 60 * 1000).optional(),
  alertWebhook: z.string().url().nullable().optional(),
  enabled: z.boolean().optional(),
  note: z.string().optional(),
  requiredVotes: z.number().int().min(1).max(5).optional(),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const items = await db.queuePolicyApproval.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { votes: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const input = schema.parse(await req.json());
  const approval = await db.queuePolicyApproval.create({
    data: {
      queueKey: input.queueKey,
      requestedById: auth.user.id,
      status: "PENDING",
      requestPayload: input,
      note: input.note,
      requiredVotes: input.requiredVotes ?? Number(process.env.QUEUE_POLICY_REQUIRED_VOTES || "2"),
    },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "QUEUE_POLICY_APPROVAL_REQUESTED",
    targetType: "QueuePolicyApproval",
    targetId: approval.id,
    metadata: input,
  });

  return NextResponse.json(approval, { status: 201 });
}
