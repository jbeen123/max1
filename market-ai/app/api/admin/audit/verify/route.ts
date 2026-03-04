import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const logs = await db.auditLog.findMany({ orderBy: { createdAt: "asc" }, take: 5000 });
  const secret = process.env.AUDIT_CHAIN_SECRET ?? "audit-dev-secret";

  let prevHash: string | null = null;
  for (const log of logs) {
    const payload: string = JSON.stringify({
      actorId: log.actorId ?? null,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      metadata: log.metadata ?? null,
      prevHash,
    });
    const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    if (log.prevHash !== prevHash || log.hash !== computed) {
      return NextResponse.json({ ok: false, brokenAt: log.id, expectedPrevHash: prevHash, storedPrevHash: log.prevHash }, { status: 409 });
    }

    prevHash = log.hash ?? null;
  }

  return NextResponse.json({ ok: true, checked: logs.length, tip: prevHash });
}
