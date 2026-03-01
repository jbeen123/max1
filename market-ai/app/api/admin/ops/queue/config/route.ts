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
});

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const queueKey = searchParams.get("queueKey") || "ATTESTATION_UPLOAD";

  const config = await db.queuePolicy.findUnique({ where: { queueKey } });
  return NextResponse.json({ queueKey, config });
}

export async function PATCH(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const input = schema.parse(await req.json());
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
    metadata: { before, after: updated },
  });

  return NextResponse.json(updated);
}
