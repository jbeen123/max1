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
   npx prisma migrate dev --name phase5_security_audit
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 5 added

- Webhook **idempotency + replay protection** via `WebhookEvent` table.
- Central **audit logging** via `AuditLog` table + `lib/audit.ts`.
- Webhooks (Stripe, KYC, E-sign) now store processed event keys and skip duplicates.
- Auth.js migration scaffold:
  - `lib/authjs.ts`
  - `app/api/auth/[...nextauth]/route.ts`
  - `middleware.ts` checks Auth.js token and still supports legacy cookie fallback.
- Payout/compliance history is now easier to trace end-to-end.

## API highlights

### Auth
- `POST /api/auth/login` — legacy MVP login + cookie
- `GET /api/auth/session` — auth state helper
- `POST /api/auth/logout` — clear auth cookie
- `GET/POST /api/auth/[...nextauth]` — Auth.js route handlers

### Webhooks with replay guard
- `POST /api/payments/webhook`
- `POST /api/kyc/webhook`
- `POST /api/esign/webhook`

### Ops + compliance
- `GET/POST /api/admin/kyc`
- `GET/POST /api/moderation`
- `POST /api/payments/connect-account`
- `POST /api/payments/payout`

## Data models

Core: `User`, `Property`, `Offer`, `KycSession`, `ESignEnvelope`, `DealTransaction`, `PayoutAccount`, `Payout`

Phase 5:
- `WebhookEvent` (idempotency)
- `AuditLog` (auditable actions)

## Env vars (important)

- `AUTH_SECRET`, `AUTH_URL` (Auth.js)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (compat)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `KYC_WEBHOOK_SECRET`, `ESIGN_WEBHOOK_SECRET`

## Next production tasks

- Finish live SDK calls in `lib/integrations/esign.ts` and `lib/integrations/kyc.ts`.
- Move UI login fully to Auth.js credential sign-in.
- Add RBAC checks to middleware by role claims.
- Add filtered audit log dashboard for admin ops.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
