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
   npx prisma migrate dev --name phase7_admin_invites_drilldown
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 7 added

- **Admin user management UI** at `/admin/users`
  - Update user role (BUYER/SELLER/ADMIN)
  - Toggle verification status
- **Invite flow**
  - Create invites at `/admin/invites`
  - Invite API: `GET/POST /api/admin/invites`
  - Invite consume API: `POST /api/auth/invite/consume`
  - Login page auto-consumes invite token when present
- **Audit drill-down**
  - Audit list links to `/admin/audit/[id]`
  - Detail page shows full metadata JSON
- **Admin users API**
  - `GET/PATCH /api/admin/users`

## API highlights

### Admin
- `GET/PATCH /api/admin/users`
- `GET/POST /api/admin/invites`
- `GET /api/admin/audit`
- `GET /api/admin/audit?format=csv`
- `GET/POST /api/admin/kyc`

### Auth
- `POST /api/auth/invite/consume`
- `GET/POST /api/auth/[...nextauth]`
- `POST /api/auth/login` (legacy bootstrap)

## Data models

- Existing: `User`, `Property`, `Offer`, `KycSession`, `ESignEnvelope`, `DealTransaction`, `PayoutAccount`, `Payout`, `WebhookEvent`, `AuditLog`
- New in phase 7: `InviteToken`

## Next production tasks

- Deliver invite links by email/SMS provider and add resend/revoke.
- Add stronger invite binding (single-use + email verification challenge).
- Add field-level audit diffs for every admin mutation.
- Add pagination + full-text search in admin tables.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
