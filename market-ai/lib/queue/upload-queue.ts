import { db } from "@/lib/db";
import { uploadAttestationOffbox } from "@/lib/storage/attestation-upload";

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
  const now = new Date();
  const jobs = await db.uploadJob.findMany({
    where: { status: { in: ["PENDING", "FAILED"] }, runAfter: { lte: now } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const job of jobs) {
    await db.uploadJob.update({ where: { id: job.id }, data: { status: "PROCESSING", attempts: { increment: 1 } } });

    try {
      const payload = (job.payload as any)?.payload;
      const result = await uploadAttestationOffbox(payload);
      if (!result.uploaded) throw new Error(result.reason || "upload failed");

      await db.uploadJob.update({ where: { id: job.id }, data: { status: "SUCCEEDED", lastError: null } });
      results.push({ id: job.id, status: "SUCCEEDED" });
    } catch (error) {
      const attempts = job.attempts + 1;
      const maxAttempts = job.maxAttempts;
      const exhausted = attempts >= maxAttempts;
      const backoffMs = Math.min(60_000 * 30, 1000 * Math.pow(2, attempts));

      await db.uploadJob.update({
        where: { id: job.id },
        data: {
          status: exhausted ? "FAILED" : "PENDING",
          runAfter: exhausted ? job.runAfter : new Date(Date.now() + backoffMs),
          lastError: String(error),
        },
      });

      results.push({ id: job.id, status: exhausted ? "FAILED" : "PENDING", error: String(error) });
    }
  }

  return results;
}
