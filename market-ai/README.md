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
   npx prisma migrate dev --name phase4_integrations
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## Included routes

- `/` — branded landing page
- `/login` — role-based MVP login (buyer/seller/admin)
- `/submit` — seller property submission (protected)
- `/search` — buyer listing search (active listings)
- `/deal-room` — offer submission + counteroffer (protected)
- `/compliance` — compliance checklist
- `/dashboard` — metrics + moderation UI + KYC + integrations (protected)

## API

### Auth
- `POST /api/auth/login` — create/login user and set auth cookie
- `GET /api/auth/me` — current user
- `GET /api/auth/session` — auth state helper
- `POST /api/auth/logout` — clear auth cookie

### Core marketplace
- `GET /api/properties` — active listings
- `POST /api/properties` — create listing (pending moderation)
- `GET /api/moderation` — admin moderation queue
- `POST /api/moderation` — approve/reject listing
- `GET /api/offers` — offer timeline (permission filtered)
- `POST /api/offers` — buyer offer submit
- `PATCH /api/offers` — seller/admin counter offer
- `GET /api/health` — health endpoint

### KYC
- `POST /api/kyc/session` — create KYC session and persist it
- `POST /api/kyc/webhook` — verify signature + update KYC/user verification
- `GET /api/admin/kyc` — admin queue of pending KYC sessions
- `POST /api/admin/kyc` — admin verify/reject KYC session

### E-sign
- `POST /api/esign/envelope` — create + persist e-sign envelope
- `POST /api/esign/webhook` — verify signature + update envelope state

### Payments / Payouts
- `POST /api/payments/intent` — create + persist Stripe PaymentIntent
- `POST /api/payments/webhook` — verify Stripe signature + update transaction status
- `POST /api/payments/connect-account` — create/update Stripe Connect seller account
- `POST /api/payments/payout` — send seller payout (transfer) + persist record

## Middleware protection

`middleware.ts` guards:
- `/submit`
- `/dashboard`
- `/deal-room`

and redirects unauthenticated users to `/login`.

## New phase 4 data models

- `PayoutAccount` — Stripe Connect account linkage
- `Payout` — disbursement ledger

(Phase 3 models remain: `KycSession`, `ESignEnvelope`, `DealTransaction`.)

## Integration notes

- E-sign + KYC provider calls are implemented through adapter modules in `lib/integrations/*` with stubs that switch to provider mode when credentials are present.
- KYC webhooks use HMAC SHA256 via `KYC_WEBHOOK_SECRET` and `x-kyc-signature`.
- E-sign webhooks use HMAC SHA256 via `ESIGN_WEBHOOK_SECRET` and `x-esign-signature`.
- Stripe webhooks require `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.
- Payments support local mock mode automatically if Stripe key is absent.

## Production hardening checklist (next)

- Replace stub integration code in `lib/integrations/esign.ts` and `lib/integrations/kyc.ts` with live SDK calls.
- Add idempotency keys + replay protection tables for all webhooks.
- Migrate MVP cookie auth to Auth.js or Clerk with signed sessions + RBAC middleware.
- Add comprehensive audit logs for moderation, KYC overrides, and payouts.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
