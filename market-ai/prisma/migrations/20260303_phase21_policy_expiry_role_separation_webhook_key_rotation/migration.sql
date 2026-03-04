-- AlterTable
ALTER TABLE "QueuePolicyApproval" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "QueuePolicyApproval_status_expiresAt_idx" ON "QueuePolicyApproval"("status", "expiresAt");

