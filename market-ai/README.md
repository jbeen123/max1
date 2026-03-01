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
   npx prisma migrate dev --name phase3_hardening
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

### Phase 2 + 3 integrations
- `POST /api/kyc/session` — create KYC session and persist it
- `POST /api/kyc/webhook` — verify signature + update KYC/user verification
- `POST /api/esign/envelope` — create + persist e-sign envelope
- `POST /api/payments/intent` — create + persist Stripe PaymentIntent
- `POST /api/payments/webhook` — verify Stripe signature + update transaction status

## Middleware protection

`middleware.ts` guards:
- `/submit`
- `/dashboard`
- `/deal-room`

and redirects unauthenticated users to `/login`.

## New phase 3 data models

- `KycSession`
- `ESignEnvelope`
- `DealTransaction`

with status enums for verification, signature lifecycle, and payment lifecycle.

## Integration notes

- KYC webhooks use HMAC SHA256 via `KYC_WEBHOOK_SECRET` and `x-kyc-signature`.
- Stripe webhooks require `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.
- E-sign provider calls are still scaffolded; map templates/recipients per contract type before production.
- MVP cookie auth is in place; production rollout should migrate to Clerk/Auth.js with RBAC middleware.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
