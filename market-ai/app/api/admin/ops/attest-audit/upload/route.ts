import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadAttestationOffbox } from "@/lib/storage/attestation-upload";
import { logAudit } from "@/lib/audit";
import { isEdgeTrusted } from "@/lib/auth-edge";
import fs from "fs/promises";

export async function POST(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  const trusted = isEdgeTrusted(req);
  if ((!auth.ok || !auth.user) && !trusted) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const latest = await db.auditAttestation.findFirst({ orderBy: { createdAt: "desc" } });
  if (!latest?.storagePath) return NextResponse.json({ error: "No attestation snapshot found" }, { status: 404 });

  const raw = await fs.readFile(latest.storagePath, "utf-8");
  const payload = JSON.parse(raw);
  const upload = await uploadAttestationOffbox(payload);

  await logAudit({
    actorId: auth.user?.id ?? null,
    action: "AUDIT_ATTESTATION_UPLOADED",
    targetType: "AuditAttestation",
    targetId: latest.id,
    metadata: upload,
  });

  return NextResponse.json({ ok: true, upload, attestationId: latest.id });
}
