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
3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## Included MVP routes

- `/` — landing page
- `/submit` — seller property submission
- `/search` — buyer listing search
- `/deal-room` — deal collaboration room
- `/compliance` — compliance checklist
- `/dashboard` — basic ops dashboard
- `/api/health` — health endpoint
- `/api/properties` — create/list properties
- `/api/matches` — simple buyer-seller matcher

## Notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
