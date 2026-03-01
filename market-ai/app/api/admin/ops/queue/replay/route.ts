import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  jobId: z.string().optional(),
  allFailed: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const [failed, pending] = await Promise.all([
    db.uploadJob.findMany({ where: { status: "FAILED" }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.uploadJob.findMany({ where: { status: "PENDING" }, orderBy: { runAfter: "asc" }, take: 100 }),
  ]);

  return NextResponse.json({ failed, pending });
}

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const input = schema.parse(await req.json());

  if (input.allFailed) {
    const updated = await db.uploadJob.updateMany({
      where: { status: "FAILED" },
      data: { status: "PENDING", runAfter: new Date(), lastError: null },
    });

    await logAudit({
      actorId: auth.user.id,
      action: "UPLOAD_QUEUE_REPLAY_ALL_FAILED",
      targetType: "UploadJob",
      targetId: "failed-set",
      metadata: { count: updated.count },
    });

    return NextResponse.json({ ok: true, replayed: updated.count });
  }

  if (!input.jobId) return NextResponse.json({ error: "jobId or allFailed required" }, { status: 400 });

  const updated = await db.uploadJob.update({
    where: { id: input.jobId },
    data: { status: "PENDING", runAfter: new Date(), lastError: null },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "UPLOAD_QUEUE_REPLAY_ONE",
    targetType: "UploadJob",
    targetId: updated.id,
  });

  return NextResponse.json({ ok: true, job: updated });
}
