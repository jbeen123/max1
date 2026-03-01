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
   npx prisma migrate dev --name phase10_resilience_controls
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 10 added

- **Audit hash-chain verification endpoint**
  - `GET /api/admin/audit/verify`
  - Recomputes chain integrity and reports first broken record
- **Rate-limit pruning operation**
  - `POST /api/admin/ops/prune-rate-limits?keepHours=72`
  - Deletes stale `RateLimitEvent` records and logs audit event
- **Signed invite URLs (nonce-less HMAC signature)**
  - Invite links now include `ts` + `sig`
  - `invite/consume` validates signature + max age
- **Edge-aware abuse controls (API layer)**
  - Invite consume applies IP-based throttling (`invite:consume:ip`)
  - Existing admin invite create/resend limits retained

## API highlights

### Audit + ops
- `GET /api/admin/audit/verify`
- `POST /api/admin/ops/prune-rate-limits?keepHours=72`

### Invite flow
- `GET /api/admin/invites?pageSize=20&cursor=<id>`
- `POST /api/admin/invites`
- `PATCH /api/admin/invites` (`revoke` | `resend`)
- `POST /api/auth/invite/consume`

### Cursor paginated admin APIs
- `GET /api/admin/users?pageSize=20&cursor=<id>&q=search`
- `GET /api/admin/audit?pageSize=30&cursor=<id>`

## Data model additions (phase 10)

(uses phase-9 schema additions)
- `RateLimitEvent` for throttling ledger
- `AuditLog.prevHash/hash` for chain integrity
- `InviteToken.lastSentAt/resendCount` for cooldown controls

## Env vars (new/important)

- `AUDIT_CHAIN_SECRET`
- `INVITE_LINK_SECRET`
- `RESEND_API_KEY`
- `INVITE_EMAIL_FROM`

## Next production tasks

- Add one-time nonce table for signed invite links (strict replay prevention).
- Add scheduled pruning job (cron/queue) for `RateLimitEvent`.
- Add chain attestation snapshots to off-box storage.
- Add WAF/edge policy for IP/device fingerprint abuse blocking.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
