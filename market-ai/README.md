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
   npx prisma migrate dev --name phase11_nonce_scheduler_attestation
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 11 added

- **One-time invite nonce replay protection**
  - Invite consume now requires signed params (`ts`, `sig`)
  - Nonce lock persisted in `InviteNonceUse`
  - Replay attempts are blocked with conflict response
- **Maintenance runner endpoint**
  - `POST /api/admin/ops/run-maintenance`
  - Runs bundled housekeeping tasks (currently rate-limit pruning)
- **Audit attestation snapshots**
  - `POST /api/admin/ops/attest-audit`
  - Writes attestations to `attestations/*.json`
  - Stores metadata in `AuditAttestation` table
- **Prune endpoint refactor**
  - `prune-rate-limits` now uses shared maintenance helper

## API highlights

### Security + integrity
- `GET /api/admin/audit/verify`
- `POST /api/admin/ops/attest-audit`
- `POST /api/admin/ops/prune-rate-limits?keepHours=72`
- `POST /api/admin/ops/run-maintenance`

### Invite security
- `POST /api/auth/invite/consume` (signed params required)

## Data model additions (phase 11)

- `InviteNonceUse` (replay lock)
- `AuditAttestation` (snapshot registry)

## Next production tasks

- Schedule `run-maintenance` + `attest-audit` via cron/queue.
- Add off-box attestation upload (S3/R2/GCS) with integrity checksum.
- Add edge proxy enforcement using `EDGE_SHARED_SECRET` for trusted headers.
- Build admin ops dashboard for maintenance/attestation history.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
