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
   npx prisma migrate dev --name phase16_circuit_history_metrics_export
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 16 added

- **Env-configurable queue circuit breaker**
  - `QUEUE_CIRCUIT_FAIL_THRESHOLD` (default 5)
  - `QUEUE_CIRCUIT_OPEN_MS` (default 300000)
- **Circuit history timeline**
  - New `QueueCircuitEvent` model
  - New endpoint: `GET /api/admin/ops/queue/history`
  - Queue console now renders open/close history timeline
- **Metrics export endpoint (Prometheus)**
  - New endpoint: `GET /api/admin/ops/queue/metrics/prometheus`
  - Exposes queue gauges for scraping

## API highlights

- `POST /api/admin/ops/queue/process?limit=50`
- `GET /api/admin/ops/queue/replay`
- `POST /api/admin/ops/queue/replay`
- `GET /api/admin/ops/queue/metrics`
- `GET /api/admin/ops/queue/metrics/prometheus`
- `GET /api/admin/ops/queue/history`

## Data model additions (phase 16)

- `QueueCircuitEvent`
- `UploadJob.errorCategory` (from phase 15)
- `QueueCircuitState` continues to track active breaker state

## Ops UI

- `/admin/ops/queue` now includes:
  - metrics + prometheus link
  - circuit history timeline
  - DLQ replay controls

## Next production tasks

- Add per-queue threshold config table in DB (runtime adjustable).
- Add queue throughput/latency percentiles to metrics endpoint.
- Add alerting integration for circuit-open events.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
