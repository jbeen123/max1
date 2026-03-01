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
   npx prisma migrate dev --name phase15_queue_circuit_metrics
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 15 added

- **DLQ retry reason categorization**
  - Upload job failures now include `errorCategory`
  - Categories include: `timeout`, `network`, `auth`, `rate_limit`, `remote_5xx`, `unknown`
- **Automatic circuit breaker for upload queue**
  - New `QueueCircuitState` model
  - Queue opens circuit after repeated failures and cools down for 5 minutes
  - Processing is skipped while circuit is open
- **Queue metrics endpoint + widgets**
  - `GET /api/admin/ops/queue/metrics`
  - Queue page now shows pending/processing/failed + 24h success/failure + circuit state

## API highlights

- `POST /api/admin/ops/queue/process?limit=50`
- `GET /api/admin/ops/queue/replay`
- `POST /api/admin/ops/queue/replay`
- `GET /api/admin/ops/queue/metrics`
- `POST /api/admin/ops/run-maintenance`

## Data model additions (phase 15)

- `QueueCircuitState`
- `UploadJob.errorCategory`

## Ops UI

- `/admin/ops/queue` now includes metrics widget and circuit status.

## Next production tasks

- Add configurable circuit thresholds (env-driven).
- Add circuit open/close history timeline in ops UI.
- Add Prometheus/OpenTelemetry export for queue metrics.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
