import { db } from "@/lib/db";
import { uploadAttestationOffbox } from "@/lib/storage/attestation-upload";

function categorizeError(error: unknown) {
  const msg = String(error || "").toLowerCase();
  if (msg.includes("timeout") || msg.includes("timed out")) return "timeout";
  if (msg.includes("network") || msg.includes("fetch")) return "network";
  if (msg.includes("401") || msg.includes("403") || msg.includes("auth")) return "auth";
  if (msg.includes("429") || msg.includes("rate")) return "rate_limit";
  if (msg.includes("5") && msg.includes("http")) return "remote_5xx";
  return "unknown";
}

const FAIL_THRESHOLD = Number(process.env.QUEUE_CIRCUIT_FAIL_THRESHOLD || "5");
const OPEN_MS = Number(process.env.QUEUE_CIRCUIT_OPEN_MS || String(5 * 60 * 1000));

async function getCircuit(queueKey: string) {
  const state = await db.queueCircuitState.findUnique({ where: { queueKey } });
  if (!state) {
    return db.queueCircuitState.create({ data: { queueKey, isOpen: false, failCountWindow: 0 } });
  }
  return state;
}

export async function enqueueAttestationUpload(attestationId: string, payload: unknown) {
  return db.uploadJob.create({
    data: {
      kind: "ATTESTATION_UPLOAD",
      payload: { attestationId, payload },
      status: "PENDING",
      runAfter: new Date(),
    },
  });
}

export async function processUploadQueue(limit = 10) {
  const queueKey = "ATTESTATION_UPLOAD";
  const circuit = await getCircuit(queueKey);

  if (circuit.isOpen && circuit.openUntil && circuit.openUntil > new Date()) {
    return [{ id: "circuit", status: "SKIPPED", error: `Circuit open until ${circuit.openUntil.toISOString()}` }];
  }

  if (circuit.isOpen && circuit.openUntil && circuit.openUntil <= new Date()) {
    await db.queueCircuitState.update({ where: { queueKey }, data: { isOpen: false, openUntil: null, failCountWindow: 0 } });
    await db.queueCircuitEvent.create({ data: { queueKey, eventType: "CLOSED", reason: "cooldown_elapsed" } });
  }

  const now = new Date();
  const jobs = await db.uploadJob.findMany({
    where: { status: { in: ["PENDING", "FAILED"] }, runAfter: { lte: now } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results: Array<{ id: string; status: string; error?: string; category?: string }> = [];
  let failuresThisRun = 0;

  for (const job of jobs) {
    await db.uploadJob.update({ where: { id: job.id }, data: { status: "PROCESSING", attempts: { increment: 1 } } });

    try {
      const payload = (job.payload as any)?.payload;
      const result = await uploadAttestationOffbox(payload);
      if (!result.uploaded) throw new Error(result.reason || "upload failed");

      await db.uploadJob.update({ where: { id: job.id }, data: { status: "SUCCEEDED", lastError: null, errorCategory: null } });
      results.push({ id: job.id, status: "SUCCEEDED" });
    } catch (error) {
      failuresThisRun += 1;
      const category = categorizeError(error);
      const attempts = job.attempts + 1;
      const exhausted = attempts >= job.maxAttempts;
      const backoffMs = Math.min(60_000 * 30, 1000 * Math.pow(2, attempts));

      await db.uploadJob.update({
        where: { id: job.id },
        data: {
          status: exhausted ? "FAILED" : "PENDING",
          runAfter: exhausted ? job.runAfter : new Date(Date.now() + backoffMs),
          lastError: String(error),
          errorCategory: category,
        },
      });

      results.push({ id: job.id, status: exhausted ? "FAILED" : "PENDING", error: String(error), category });
    }
  }

  if (failuresThisRun > 0) {
    const nextFailCount = circuit.failCountWindow + failuresThisRun;
    const shouldOpen = nextFailCount >= FAIL_THRESHOLD;

    await db.queueCircuitState.upsert({
      where: { queueKey },
      update: {
        failCountWindow: shouldOpen ? 0 : nextFailCount,
        isOpen: shouldOpen,
        openedAt: shouldOpen ? new Date() : circuit.openedAt,
        openUntil: shouldOpen ? new Date(Date.now() + OPEN_MS) : circuit.openUntil,
      },
      create: {
        queueKey,
        failCountWindow: shouldOpen ? 0 : nextFailCount,
        isOpen: shouldOpen,
        openedAt: shouldOpen ? new Date() : null,
        openUntil: shouldOpen ? new Date(Date.now() + OPEN_MS) : null,
      },
    });

    if (shouldOpen) {
      await db.queueCircuitEvent.create({ data: { queueKey, eventType: "OPENED", reason: `failures>=${FAIL_THRESHOLD}` } });
    }
  } else if (jobs.length > 0) {
    await db.queueCircuitState.updateMany({ where: { queueKey }, data: { failCountWindow: 0 } });
  }

  return results;
}
