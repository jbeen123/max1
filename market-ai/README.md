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
   npx prisma migrate dev --name phase6_auth_rbac_audit_ui
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 6 added

- **Auth.js login UI flow** on `/login` using credentials sign-in.
- Session-aware navbar with inline user identity + logout button.
- **Role-based middleware enforcement**:
  - `/dashboard`, `/admin/*` => `ADMIN`
  - `/submit` => `SELLER | ADMIN`
  - `/deal-room` => `BUYER | SELLER | ADMIN`
- **Admin audit logs page** at `/admin/audit` with filters.
- **Audit export endpoint**: `GET /api/admin/audit?format=csv`.

## API highlights

### Auth
- `POST /api/auth/login` — legacy bootstrap for first-time users
- `GET /api/auth/session` — auth state helper
- `POST /api/auth/logout` — clear legacy auth cookie
- `GET/POST /api/auth/[...nextauth]` — Auth.js handlers

### Admin
- `GET /api/admin/audit` — filterable audit entries (JSON)
- `GET /api/admin/audit?format=csv` — CSV export
- `GET/POST /api/admin/kyc` — pending KYC queue + admin override

### Webhooks with replay guard
- `POST /api/payments/webhook`
- `POST /api/kyc/webhook`
- `POST /api/esign/webhook`

## Data models

Core: `User`, `Property`, `Offer`, `KycSession`, `ESignEnvelope`, `DealTransaction`, `PayoutAccount`, `Payout`

Security/compliance:
- `WebhookEvent` (idempotency)
- `AuditLog` (auditable actions)

## Env vars (important)

- `AUTH_SECRET`, `AUTH_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `KYC_WEBHOOK_SECRET`, `ESIGN_WEBHOOK_SECRET`

## Next production tasks

- Complete live SDK calls in integration adapters (`lib/integrations/*`).
- Remove legacy cookie auth endpoint after full Auth.js migration.
- Add signed invite/onboarding flow for admin and seller provisioning.
- Build audit-log drill-down UI for metadata inspection and trace links.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
