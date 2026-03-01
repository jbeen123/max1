import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { isEdgeTrusted } from "@/lib/auth-edge";
import { enqueueAttestationUpload, processUploadQueue } from "@/lib/queue/upload-queue";
import fs from "fs/promises";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  const trusted = isEdgeTrusted(req);
  if ((!auth.ok || !auth.user) && !trusted) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const latest = await db.auditAttestation.findFirst({ orderBy: { createdAt: "desc" } });
  if (!latest?.storagePath) return NextResponse.json({ error: "No attestation snapshot found" }, { status: 404 });

  const raw = await fs.readFile(latest.storagePath, "utf-8");
  const payload = JSON.parse(raw);

  const enqueued = await enqueueAttestationUpload(latest.id, payload);
  const processed = await processUploadQueue(3);

  await logAudit({
    actorId: auth.user?.id ?? null,
    action: "AUDIT_ATTESTATION_UPLOAD_ENQUEUED",
    targetType: "UploadJob",
    targetId: enqueued.id,
    metadata: { attestationId: latest.id, processed },
  });

  return NextResponse.json({ ok: true, enqueuedJobId: enqueued.id, processed, attestationId: latest.id });
}
