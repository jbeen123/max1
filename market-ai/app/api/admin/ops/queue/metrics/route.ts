import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pending, processing, failed, succeeded24h, failed24h, circuit] = await Promise.all([
    db.uploadJob.count({ where: { status: "PENDING" } }),
    db.uploadJob.count({ where: { status: "PROCESSING" } }),
    db.uploadJob.count({ where: { status: "FAILED" } }),
    db.uploadJob.count({ where: { status: "SUCCEEDED", updatedAt: { gte: since } } }),
    db.uploadJob.count({ where: { status: "FAILED", updatedAt: { gte: since } } }),
    db.queueCircuitState.findUnique({ where: { queueKey: "ATTESTATION_UPLOAD" } }),
  ]);

  const errorBreakdown = await db.uploadJob.groupBy({
    by: ["errorCategory"],
    where: { status: "FAILED" },
    _count: { _all: true },
  });

  return NextResponse.json({
    pending,
    processing,
    failed,
    succeeded24h,
    failed24h,
    circuit,
    errorBreakdown,
  });
}
