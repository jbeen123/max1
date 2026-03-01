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
   npx prisma migrate dev --name phase17_runtime_policy_alerts_latency
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 17 added

- **Runtime DB-configurable queue policy**
  - New model: `QueuePolicy`
  - New API: `GET/PATCH /api/admin/ops/queue/config`
  - Supports live updates to fail threshold, open duration, alert webhook, enabled flag
- **Alert hooks on circuit-open**
  - New alert helper: `lib/alerts/queue-alert.ts`
  - Queue processor sends alert when breaker opens
  - Optional manual test endpoint: `POST /api/admin/ops/queue/alerts`
- **Latency percentile metrics**
  - Queue metrics now include p50/p95/p99 latency in ms over last 24h succeeded jobs
- **Queue policy controls in UI**
  - `/admin/ops/queue` now includes policy editor form

## API highlights

- `GET /api/admin/ops/queue/config?queueKey=ATTESTATION_UPLOAD`
- `PATCH /api/admin/ops/queue/config`
- `POST /api/admin/ops/queue/alerts`
- `GET /api/admin/ops/queue/metrics`
- `GET /api/admin/ops/queue/metrics/prometheus`
- `GET /api/admin/ops/queue/history`

## Data model additions (phase 17)

- `QueuePolicy`

## Env vars (phase 17)

- `QUEUE_ALERT_WEBHOOK_URL`

(Existing: `QUEUE_CIRCUIT_FAIL_THRESHOLD`, `QUEUE_CIRCUIT_OPEN_MS` for bootstrap defaults)

## Next production tasks

- Add per-environment policy promotion workflow and change approvals.
- Add queue alert dedup/suppression window.
- Add histogram buckets for latency in Prometheus export.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
