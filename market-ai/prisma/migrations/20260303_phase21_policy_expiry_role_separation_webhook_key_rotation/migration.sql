-- Phase 21 additive changes (idempotent for fresh baseline installs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'QueuePolicyApproval'
      AND column_name = 'expiresAt'
  ) THEN
    ALTER TABLE "QueuePolicyApproval" ADD COLUMN "expiresAt" TIMESTAMP(3);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "QueuePolicyApproval_status_expiresAt_idx"
  ON "QueuePolicyApproval"("status", "expiresAt");

