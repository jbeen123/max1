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
   npx prisma migrate dev --name phase9_security_controls
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 9 added

- **Invite rate limiting + cooldowns**
  - Invite creation limited per admin per hour
  - Invite resend limited per admin per hour
  - 60-second resend cooldown per invite token
- **Cursor pagination for admin APIs**
  - Users, Invites, and Audit endpoints now support `cursor` + `pageSize`
- **Audit chain integrity (tamper-evident)**
  - `AuditLog` now stores `prevHash` + `hash`
  - `logAudit()` computes HMAC hash chain with `AUDIT_CHAIN_SECRET`
- **Operational rate-limit ledger**
  - `RateLimitEvent` model tracks control events for throttling decisions

## API highlights

### Admin users (cursor pagination)
- `GET /api/admin/users?pageSize=20&cursor=<id>&q=search`
- `PATCH /api/admin/users`

### Admin invites (cursor pagination + actions)
- `GET /api/admin/invites?pageSize=20&cursor=<id>`
- `POST /api/admin/invites`
- `PATCH /api/admin/invites` (`revoke` | `resend`)

### Audit (cursor pagination)
- `GET /api/admin/audit?pageSize=30&cursor=<id>`
- `GET /api/admin/audit?format=csv`

## Data model changes (phase 9)

- `InviteToken`
  - `lastSentAt`
  - `resendCount`
- `AuditLog`
  - `prevHash`
  - `hash`
- `RateLimitEvent`

## Env vars (new in phase 9)

- `AUDIT_CHAIN_SECRET`

## Next production tasks

- Add background pruning for `RateLimitEvent` rows.
- Add endpoint to verify full audit hash chain integrity.
- Add hard IP-based throttling at edge/load balancer.
- Add signed/expiring invite links with nonce binding.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
