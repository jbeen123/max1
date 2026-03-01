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
   npx prisma migrate dev --name phase8_admin_ops_scaling
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 8 added

- **Invite revoke + resend**
  - `PATCH /api/admin/invites` with actions `revoke` and `resend`
  - Invite records now support `revokedAt` and `revokedById`
- **Invite email delivery integration**
  - Added `lib/notify.ts` with Resend provider support
  - Invite create/resend attempts delivery and logs outcome
- **Pagination + search in admin tables**
  - Users page supports search and paging
  - Invites page supports paging
  - Audit page supports paging
- **Richer audit drill-down**
  - Detail page now renders before/after diff table when available
  - Audit API CSV export includes metadata column

## API highlights

### Admin users
- `GET /api/admin/users?page=1&pageSize=20&q=search`
- `PATCH /api/admin/users`

### Admin invites
- `GET /api/admin/invites?page=1&pageSize=20`
- `POST /api/admin/invites`
- `PATCH /api/admin/invites` (`revoke` | `resend`)

### Audit
- `GET /api/admin/audit?page=1&pageSize=30`
- `GET /api/admin/audit?format=csv`

### Invite onboarding
- `POST /api/auth/invite/consume`

## Data model changes

- `InviteToken` now includes:
  - `revokedAt`
  - `revokedById`

## Env vars (new in phase 8)

- `RESEND_API_KEY`
- `INVITE_EMAIL_FROM`

## Next production tasks

- Add invite resend throttling + cooldowns.
- Add soft-delete/archive for users and invites.
- Add cursor-based pagination for very large admin tables.
- Add email template branding + signed deep links.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
