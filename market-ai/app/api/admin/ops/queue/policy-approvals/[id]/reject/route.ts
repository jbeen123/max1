import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const schema = z.object({ note: z.string().optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { id } = await params;
  const body = schema.parse(await req.json().catch(() => ({})));
  const approval = await db.queuePolicyApproval.findUnique({ where: { id } });
  if (!approval) return NextResponse.json({ error: "Approval not found" }, { status: 404 });
  if (approval.status !== "PENDING") return NextResponse.json({ error: "Approval already decided" }, { status: 400 });

  const decided = await db.queuePolicyApproval.update({
    where: { id },
    data: { status: "REJECTED", approvedById: auth.user.id, decidedAt: new Date(), note: body.note ?? approval.note },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "QUEUE_POLICY_REJECTED",
    targetType: "QueuePolicyApproval",
    targetId: decided.id,
    metadata: { note: body.note },
  });

  return NextResponse.json({ approval: decided });
}
