# market.ai scaffold

Compliance-first marketplace scaffold for connecting land/real-estate sellers and buyers.

## Quick start

1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Generate Prisma client + run migration:
   ```bash
   npm run prisma:generate
   npx prisma migrate dev --name phase13_scheduler_lock_queue
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 13 added

- **Scheduler lock (concurrency guard)**
  - `OpsLock` model
  - `run-maintenance` now acquires/release lock, preventing concurrent runs
- **Retry/backoff upload queue**
  - `UploadJob` model + `UploadJobStatus`
  - `lib/queue/upload-queue.ts` handles queue processing with exponential backoff
  - `attest-audit/upload` now enqueues jobs and processes queue batch
- **Manual ops controls in UI**
  - Added `OpsActions` component on `/admin/ops`
  - One-click actions for maintenance, attestation, and upload

## API highlights

- `POST /api/admin/ops/run-maintenance`
- `POST /api/admin/ops/attest-audit`
- `POST /api/admin/ops/attest-audit/upload`
- `POST /api/admin/ops/prune-rate-limits?keepHours=72`
- `GET /api/admin/audit/verify`

## Data model additions (phase 13)

- `OpsLock`
- `UploadJob`
- `UploadJobStatus` enum

## Automation notes

- Keep `scripts/cron-phase12.sh` and call it on schedule.
- Locking prevents overlapping runs if cron overlaps.
- Failed uploads remain queued and retry automatically on next maintenance run.

## Next production tasks

- Add dedicated worker process for queue processing (instead of request path).
- Add dead-letter queue UI + replay controls.
- Add stronger lock ownership token/heartbeat renewal.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
