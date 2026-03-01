import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

export async function GET() {
  const auth = await requireRole(["ADMIN"]);
  if (!auth.ok) {
    return new Response("# unauthorized\n", { status: 403, headers: { "Content-Type": "text/plain; version=0.0.4" } });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [pending, processing, failed, succeeded24h, failed24h, circuit, recentSucceeded] = await Promise.all([
    db.uploadJob.count({ where: { status: "PENDING" } }),
    db.uploadJob.count({ where: { status: "PROCESSING" } }),
    db.uploadJob.count({ where: { status: "FAILED" } }),
    db.uploadJob.count({ where: { status: "SUCCEEDED", updatedAt: { gte: since } } }),
    db.uploadJob.count({ where: { status: "FAILED", updatedAt: { gte: since } } }),
    db.queueCircuitState.findUnique({ where: { queueKey: "ATTESTATION_UPLOAD" } }),
    db.uploadJob.findMany({ where: { status: "SUCCEEDED", updatedAt: { gte: since } }, select: { createdAt: true, updatedAt: true }, take: 1000 }),
  ]);

  const latenciesMs = recentSucceeded.map((j) => Math.max(0, j.updatedAt.getTime() - j.createdAt.getTime())).sort((a, b) => a - b);
  const p50 = percentile(latenciesMs, 50);
  const p95 = percentile(latenciesMs, 95);
  const p99 = percentile(latenciesMs, 99);

  const lines = [
    "# TYPE marketai_queue_pending gauge",
    `marketai_queue_pending{queue=\"attestation_upload\"} ${pending}`,
    "# TYPE marketai_queue_processing gauge",
    `marketai_queue_processing{queue=\"attestation_upload\"} ${processing}`,
    "# TYPE marketai_queue_failed gauge",
    `marketai_queue_failed{queue=\"attestation_upload\"} ${failed}`,
    "# TYPE marketai_queue_succeeded_24h gauge",
    `marketai_queue_succeeded_24h{queue=\"attestation_upload\"} ${succeeded24h}`,
    "# TYPE marketai_queue_failed_24h gauge",
    `marketai_queue_failed_24h{queue=\"attestation_upload\"} ${failed24h}`,
    "# TYPE marketai_queue_circuit_open gauge",
    `marketai_queue_circuit_open{queue=\"attestation_upload\"} ${circuit?.isOpen ? 1 : 0}`,
    "# TYPE marketai_queue_latency_ms_p50 gauge",
    `marketai_queue_latency_ms_p50{queue=\"attestation_upload\"} ${p50}`,
    "# TYPE marketai_queue_latency_ms_p95 gauge",
    `marketai_queue_latency_ms_p95{queue=\"attestation_upload\"} ${p95}`,
    "# TYPE marketai_queue_latency_ms_p99 gauge",
    `marketai_queue_latency_ms_p99{queue=\"attestation_upload\"} ${p99}`,
  ];

  return new Response(`${lines.join("\n")}\n`, { headers: { "Content-Type": "text/plain; version=0.0.4" } });
}
