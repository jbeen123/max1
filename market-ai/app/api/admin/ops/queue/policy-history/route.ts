import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const queueKey = searchParams.get("queueKey") || "ATTESTATION_UPLOAD";

  const logs = await db.auditLog.findMany({
    where: { action: "QUEUE_POLICY_UPDATED", targetType: "QueuePolicy", targetId: queueKey },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ items: logs });
}
