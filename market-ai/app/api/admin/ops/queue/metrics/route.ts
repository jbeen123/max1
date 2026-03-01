import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pending, processing, failed, succeeded24h, failed24h, circuit, policy, recentSucceeded] = await Promise.all([
    db.uploadJob.count({ where: { status: "PENDING" } }),
    db.uploadJob.count({ where: { status: "PROCESSING" } }),
    db.uploadJob.count({ where: { status: "FAILED" } }),
    db.uploadJob.count({ where: { status: "SUCCEEDED", updatedAt: { gte: since } } }),
    db.uploadJob.count({ where: { status: "FAILED", updatedAt: { gte: since } } }),
    db.queueCircuitState.findUnique({ where: { queueKey: "ATTESTATION_UPLOAD" } }),
    db.queuePolicy.findUnique({ where: { queueKey: "ATTESTATION_UPLOAD" } }),
    db.uploadJob.findMany({ where: { status: "SUCCEEDED", updatedAt: { gte: since } }, select: { createdAt: true, updatedAt: true }, take: 1000 }),
  ]);

  const errorBreakdown = await db.uploadJob.groupBy({ by: ["errorCategory"], where: { status: "FAILED" }, _count: { _all: true } });

  const latenciesMs = recentSucceeded
    .map((j) => Math.max(0, j.updatedAt.getTime() - j.createdAt.getTime()))
    .sort((a, b) => a - b);

  return NextResponse.json({
    pending,
    processing,
    failed,
    succeeded24h,
    failed24h,
    circuit,
    policy,
    errorBreakdown,
    latencyMs: {
      count: latenciesMs.length,
      p50: percentile(latenciesMs, 50),
      p95: percentile(latenciesMs, 95),
      p99: percentile(latenciesMs, 99),
    },
  });
}
