# Market-AI Project Structure

## 📁 Root Directory

```
market-ai/
├── 📁 app/                    # Next.js App Router (pages & API routes)
├── 📁 components/             # Shared React components
├── 📁 lib/                    # Utility functions & business logic
├── 📁 prisma/                 # Database schema & migrations
├── 📁 scripts/                # Automation & seed scripts
├── 📁 docs/                   # Documentation
├── 📁 config/                 # Configuration files
├── 📁 types/                  # Global TypeScript types
├── 📁 tests/                  # Test suites
├── 📄 middleware.ts           # Next.js middleware
├── 📄 next.config.ts          # Next.js configuration
├── 📄 tailwind.config.ts      # Tailwind CSS config
├── 📄 postcss.config.js       # PostCSS config
├── 📄 tsconfig.json           # TypeScript config
├── 📄 package.json            # Dependencies
└── 📄 README.md               # Project overview
```

---

## 📁 app/ - Application Routes

### Page Routes (Features)
- `admin/` - Admin dashboard & management
- `compliance/` - Compliance center
- `contracts/` - Contract management
- `dashboard/` - Main user dashboard
- `deal-room/` - Deal negotiation space
- `investors/` - Investor profiles & management
- `land-scanner/` - AI land scanning feature
- `login/` - Authentication
- `matches/` - Property matching
- `messages/` - User messaging
- `notifications/` - Notification center
- `property/` - Property listings
- `public-info/` - Public information
- `public-records/` - Public records access
- `search/` - Property search
- `submit/` - Property submission

### API Routes
- `api/admin/` - Admin operations
- `api/auth/` - Authentication (NextAuth)
- `api/contracts/` - Contract APIs
- `api/conversations/` - Messaging APIs
- `api/esign/` - E-signature integration
- `api/health/` - Health checks
- `api/kyc/` - KYC verification
- `api/land-scanner/` - Land scanner APIs
- `api/matches/` - Matching algorithms
- `api/moderation/` - Content moderation
- `api/notifications/` - Notification APIs
- `api/offers/` - Offer management
- `api/payments/` - Payment processing (Stripe)
- `api/properties/` - Property CRUD
- `api/public-records/` - Public records APIs

---

## 📁 components/ - React Components

Shared UI components used across the application:
- `AuthStatus.tsx` - Authentication status display
- `ComplianceBadge.tsx` - Compliance indicators
- `IntegrationsPanel.tsx` - Third-party integrations
- `KycPanel.tsx` - KYC verification UI
- `ModerationQueue.tsx` - Content moderation interface
- `NotificationBell.tsx` - Notification indicator
- `OpsActions.tsx` - Operations actions panel
- `Providers.tsx` - Context providers wrapper

---

## 📁 lib/ - Business Logic & Utilities

### Core Utilities
- `auth.ts` - Authentication helpers
- `auth-edge.ts` - Edge runtime auth
- `authjs.ts` - Auth.js configuration
- `db.ts` - Database connection
- `notify.ts` - Notification helpers
- `rate-limit.ts` - Rate limiting
- `webhooks.ts` - Webhook utilities

### Feature Modules
- `ai/` - AI/ML services
  - `buyer-matching.ts`
  - `land-scanner.ts`
  - `land-valuation.ts`
  - `lead-scoring.ts`
  - `matching.ts`
  - `offer-generator.ts`

- `alerts/` - Alert system
  - `queue-alert.ts`

- `contracts/` - Contract logic
  - `clauses.ts`
  - `compliance-check.ts`
  - `templates.ts`

- `integrations/` - Third-party integrations

- `ops/` - Operations tools
  - `lock.ts`
  - `maintenance.ts`

- `public-records/` - Public records handling

- `queue/` - Job queue management
  - `policy.ts`
  - `policy-access.ts`
  - `policy-approval-expiry.ts`
  - `upload-queue.ts`

- `security/` - Security utilities
  - `signed-invite.ts`
  - `webhook-keys.ts`
  - `webhook-signing.ts`
  - `webhook-verify.ts`

- `storage/` - File storage utilities

---

## 📁 prisma/ - Database

- `schema.prisma` - Database schema definition
- `migrations/` - Database migrations

---

## 📁 scripts/ - Automation

- `cron-phase12.sh` - Phase 1-2 cron job
- `cron-phase21-expire-approvals.sh` - Approval expiry cron
- `seed-phase24.js` - Database seeding (Phase 24)
- `seed-realistic.js` - Realistic data seeding
- `worker-phase14.sh` - Background worker

---

## 📁 docs/ - Documentation

- `architecture/` - System architecture docs
- `api/` - API documentation
- `deployment/` - Deployment guides

---

## 📁 config/ - Configuration

Environment-specific configurations

---

## 📁 types/ - TypeScript Types

Global type definitions

---

## 📁 tests/ - Testing

- `unit/` - Unit tests
- `e2e/` - End-to-end tests
- `integration/` - Integration tests

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Next.js middleware (auth, routing) |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS styling |
| `postcss.config.js` | PostCSS processing |
| `tsconfig.json` | TypeScript compiler options |
| `.env` / `.env.example` | Environment variables |
| `.gitignore` | Git ignore patterns |

---

## 🏷️ Naming Conventions

- **Folders**: kebab-case (e.g., `land-scanner`, `public-records`)
- **Components**: PascalCase (e.g., `KycPanel.tsx`)
- **Utilities**: camelCase (e.g., `buyer-matching.ts`)
- **API Routes**: kebab-case (e.g., `cash-buyers/route.ts`)
- **Database**: snake_case in Prisma schema

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables: `cp .env.example .env`
3. Run database migrations: `npx prisma migrate dev`
4. Seed the database: `node scripts/seed-realistic.js`
5. Start development server: `npm run dev`
