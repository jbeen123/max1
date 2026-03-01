import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok || !auth.user) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const [count, latest] = await Promise.all([
    db.auditLog.count(),
    db.auditLog.findFirst({ orderBy: { createdAt: "desc" } }),
  ]);

  const tipHash = latest?.hash ?? "";
  const ts = new Date().toISOString().replaceAll(":", "-");
  const dir = path.join(process.cwd(), "attestations");
  await fs.mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, `audit-attestation-${ts}.json`);

  const payload = {
    generatedAt: new Date().toISOString(),
    logCount: count,
    tipHash,
  };

  await fs.writeFile(storagePath, JSON.stringify(payload, null, 2), "utf-8");

  const saved = await db.auditAttestation.create({
    data: { tipHash, logCount: count, storagePath },
  });

  await logAudit({
    actorId: auth.user.id,
    action: "AUDIT_ATTESTATION_CREATED",
    targetType: "AuditAttestation",
    targetId: saved.id,
    metadata: payload,
  });

  return NextResponse.json({ ok: true, attestation: saved });
}
