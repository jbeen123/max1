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
   npx prisma migrate dev --name phase18_policy_audit_alert_ops
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 18 added

- **Per-queue runtime policy framework (DB-first)**
  - Queue processor now sources policy from `QueuePolicy` table
  - Env vars are bootstrap defaults only
- **Policy change traceability API**
  - `GET /api/admin/ops/queue/policy-history?queueKey=ATTESTATION_UPLOAD`
  - Reads `QUEUE_POLICY_UPDATED` entries from audit log
- **Alert testing endpoint + UI hook**
  - `POST /api/admin/ops/queue/alerts`
  - Queue console now has "Send Test Alert"
- **Latency + policy observability improvements**
  - Queue metrics include policy and latency percentiles
  - Prometheus export includes queue latency gauges
- **Circuit event persistence**
  - New model: `QueueCircuitEvent` used for open/close timeline

## API highlights

- `GET/PATCH /api/admin/ops/queue/config`
- `GET /api/admin/ops/queue/policy-history`
- `POST /api/admin/ops/queue/alerts`
- `GET /api/admin/ops/queue/metrics`
- `GET /api/admin/ops/queue/metrics/prometheus`
- `GET /api/admin/ops/queue/history`

## Data model additions (phase 18)

- `QueuePolicy`
- `QueueCircuitEvent`

## Ops UI

- `/admin/ops/queue` now includes:
  - runtime policy editor
  - policy change history
  - test alert trigger
  - circuit timeline
  - latency/circuit metrics

## Env vars

- `QUEUE_ALERT_WEBHOOK_URL` (default alert target)
- `QUEUE_CIRCUIT_FAIL_THRESHOLD` and `QUEUE_CIRCUIT_OPEN_MS` now act as bootstrap defaults if no policy exists yet

## Next production tasks

- Add role-approval workflow for policy edits in production.
- Add webhook secret signing for alert callbacks.
- Add metric labels for error categories in Prometheus endpoint.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
