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
   npx prisma migrate dev --name phase14_worker_dlq_console
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 14 added

- **Dedicated queue worker endpoint**
  - `POST /api/admin/ops/queue/process?limit=50`
  - Processes upload queue independently from maintenance run
- **Dead-letter queue console**
  - New page: `/admin/ops/queue`
  - Shows failed + pending jobs
  - Supports replay single job and replay all failed jobs
- **Replay API controls**
  - `GET /api/admin/ops/queue/replay` (list failed/pending)
  - `POST /api/admin/ops/queue/replay` (replay one/all)
- **Ops dashboard linkout**
  - `/admin/ops` now links directly to queue console
- **Worker script**
  - `scripts/worker-phase14.sh`
  - Calls queue process endpoint with edge secret

## API highlights

- `POST /api/admin/ops/queue/process?limit=50`
- `GET /api/admin/ops/queue/replay`
- `POST /api/admin/ops/queue/replay`
- `POST /api/admin/ops/run-maintenance`
- `POST /api/admin/ops/attest-audit`
- `POST /api/admin/ops/attest-audit/upload`

## Automation examples

Queue worker every 5 minutes:

```bash
*/5 * * * * cd /home/jahffy/.openclaw/workspace/market-ai && EDGE_SHARED_SECRET='your-secret' BASE_URL='http://localhost:3000' ./scripts/worker-phase14.sh >> /tmp/marketai-worker.log 2>&1
```

## Next production tasks

- Move queue execution into dedicated worker service/process manager.
- Add DLQ retry reason categorization + automatic circuit breaker.
- Add queue metrics widgets (success/fail latency) in ops dashboard.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
