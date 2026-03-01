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
   npx prisma migrate dev --name phase12_ops_automation_offbox
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 12 added

- **Cron wiring path**
  - Script: `scripts/cron-phase12.sh`
  - Runs maintenance + attestation + upload in sequence
  - Uses `x-edge-secret` with `EDGE_SHARED_SECRET`
- **Off-box attestation upload**
  - `POST /api/admin/ops/attest-audit/upload`
  - Uses `OFFBOX_ATTESTATION_URL` (+ optional bearer token)
  - Upload helper: `lib/storage/attestation-upload.ts`
- **Admin ops dashboard UI**
  - New page: `/admin/ops`
  - Shows recent attestation records + latest prune timestamp
- **Ops access helper for automation**
  - `lib/auth-edge.ts` enables trusted edge/system calls with shared secret

## API highlights

- `POST /api/admin/ops/run-maintenance`
- `POST /api/admin/ops/prune-rate-limits?keepHours=72`
- `POST /api/admin/ops/attest-audit`
- `POST /api/admin/ops/attest-audit/upload`
- `GET /api/admin/audit/verify`

## Automation example (cron)

Run every hour:

```bash
0 * * * * cd /home/jahffy/.openclaw/workspace/market-ai && EDGE_SHARED_SECRET='your-secret' BASE_URL='http://localhost:3000' ./scripts/cron-phase12.sh >> /tmp/marketai-maint.log 2>&1
```

## Env vars (phase 12)

- `EDGE_SHARED_SECRET`
- `OFFBOX_ATTESTATION_URL`
- `OFFBOX_ATTESTATION_TOKEN`

(Existing important vars: `AUDIT_CHAIN_SECRET`, `INVITE_LINK_SECRET`, `RESEND_API_KEY`, auth vars)

## Next production tasks

- Replace HTTP off-box upload with signed object-store upload (S3/R2) + checksum manifest.
- Add retry/backoff + dead-letter handling for failed uploads.
- Add explicit scheduler lock to avoid concurrent maintenance runs.
- Build ops UI buttons for manual run + upload trigger.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
