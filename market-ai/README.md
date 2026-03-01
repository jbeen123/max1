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
   npx prisma migrate dev --name init_market_ai
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## Included MVP routes

- `/` — landing page
- `/login` — role-based MVP login (buyer/seller/admin)
- `/submit` — seller property submission (requires seller/admin)
- `/search` — buyer listing search (active listings)
- `/deal-room` — offer submission + counteroffer
- `/compliance` — compliance checklist
- `/dashboard` — metrics + moderation queue

## API

- `POST /api/auth/login` — create/login user and set auth cookie
- `GET /api/auth/me` — current user
- `GET /api/properties` — active listings
- `POST /api/properties` — create listing (pending moderation)
- `GET /api/moderation` — admin moderation queue
- `POST /api/moderation` — approve/reject listing
- `GET /api/offers` — offer timeline (permission filtered)
- `POST /api/offers` — buyer offer submit
- `PATCH /api/offers` — seller/admin counter offer
- `/api/health` — health endpoint

## Notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
- Replace MVP auth with a production auth provider (Clerk/Auth.js) before release.
