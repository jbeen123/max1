# 🏠 Market-AI

Compliance-first marketplace scaffold for connecting land/real-estate sellers and buyers.

## 📚 Documentation

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Complete folder organization guide
- **[app/README.md](./app/README.md)** - App routes documentation
- **[lib/README.md](./lib/README.md)** - Business logic documentation
- **[components/README.md](./components/README.md)** - Component documentation
- **[scripts/README.md](./scripts/README.md)** - Automation scripts
- **[prisma/README.md](./prisma/README.md)** - Database documentation

---

## 🚀 Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed the database (optional)
node scripts/seed-realistic.js

# 6. Start development server
npm run dev
```

---

## 📁 Project Structure

```
market-ai/
├── 📱 app/                    # Next.js App Router (pages & API)
│   ├── admin/                 # Admin dashboard
│   ├── api/                   # API routes
│   ├── dashboard/             # User dashboard
│   ├── land-scanner/          # AI land scanning
│   ├── login/                 # Authentication
│   └── ...
├── 🧩 components/             # Shared React components
├── 🔧 lib/                    # Business logic & utilities
│   ├── ai/                    # AI/ML services
│   ├── contracts/             # Contract management
│   ├── queue/                 # Job queue
│   ├── security/              # Security utilities
│   └── ...
├── 🗄️ prisma/                 # Database schema & migrations
├── 🔨 scripts/                # Automation & seeding
└── 📖 docs/                   # Documentation
```

---

## 🏗️ Architecture Overview

### Core Features
- **🔍 AI Land Scanner** - Automated land opportunity detection
- **🤝 Matching Engine** - AI-powered buyer-property matching
- **💬 Messaging** - Buyer-seller communication
- **🔔 Notifications** - In-app notification system
- **📋 Contracts** - E-signature & contract management
- **💳 Payments** - Stripe integration
- **✅ Compliance** - KYC & regulatory compliance
- **👥 Admin** - Team management & policy controls

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **AI**: Custom ML models
- **Payments**: Stripe
- **E-sign**: DocuSign

---

## 📊 Feature Phases

<details>
<summary><strong>Phase 20</strong> - Quorum Approvals & Webhook Security</summary>

- **Quorum-based policy approvals** (2-of-N style)
  - Vote model: `QueuePolicyApprovalVote`
  - Requester cannot self-approve
- **Signed alert anti-replay receiver**
  - Webhook verification with nonce registry
  - Test receiver endpoint: `POST /api/admin/ops/queue/alerts/test`

**Env vars**: `QUEUE_POLICY_REQUIRED_VOTES`, `QUEUE_ALERT_SIGNING_SECRET`
</details>

<details>
<summary><strong>Phase 21</strong> - Team Separation & Auto-Expiry</summary>

- **Requester/approver separation**
  - Email/domain allowlists
- **Automatic expiration** for stale approvals
  - Configurable TTL: `QUEUE_POLICY_APPROVAL_TTL_HOURS`
- **Rotating webhook signing keys**
  - Key-id header support
  - Keyring: `QUEUE_ALERT_SIGNING_KEYS_JSON`

**Cron**: `scripts/cron-phase21-expire-approvals.sh` (hourly)
</details>

<details>
<summary><strong>Phase 22</strong> - DB Teams & Key Rotation UI</summary>

- **DB-backed policy teams** (replaces env allowlists)
  - Models: `PolicyTeam`, `PolicyTeamMember`
  - Full CRUD admin API
- **Webhook key rotation admin UI**
  - Model: `WebhookSigningKey`
  - Endpoints: list, generate, activate, revoke
  - Health check: `GET /api/admin/ops/queue/webhook-health`
</details>

<details>
<summary><strong>Phase 23</strong> - Notifications & Messaging</strong></summary>

- **In-app notifications**
  - Typed events (offers, KYC, contracts, payments)
  - `NotificationBell` component with real-time badge
- **Buyer ↔ Seller messaging**
  - Models: `Conversation`, `ConversationParticipant`, `Message`
  - Full chat UI at `/messages`
</details>

<details>
<summary><strong>Phase 24</strong> - Contact Info & Images</summary>

- Extended contact information
- Image upload support
</details>

---

## 🔌 API Highlights

### Admin Operations
```
GET/POST   /api/admin/ops/queue/policy-approvals
POST       /api/admin/ops/queue/policy-approvals/:id/approve
POST       /api/admin/ops/queue/policy-approvals/:id/reject
POST       /api/admin/ops/queue/policy-approvals/expire
GET/POST   /api/admin/ops/queue/teams
GET/POST   /api/admin/ops/queue/webhook-keys
```

### Core Features
```
GET/POST   /api/conversations
GET/POST   /api/conversations/:id/messages
GET/PATCH  /api/notifications
GET/POST   /api/properties
GET/POST   /api/matches
```

---

## ⚙️ Environment Variables

### Required
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Feature Flags
```bash
# Phase 20+
QUEUE_POLICY_REQUIRED_VOTES=2
QUEUE_ALERT_SIGNING_SECRET="secret"

# Phase 21+
QUEUE_POLICY_APPROVAL_TTL_HOURS=24
QUEUE_ALERT_SIGNING_KEYS_JSON='[{"kid":"key1","secret":"secret1"}]'

# Phase 22+
# Teams now in DB - no env vars needed
```

See `.env.example` for complete list.

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run specific test
npm test -- matching.test.ts
```

---

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` with production DB
- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Configure webhook endpoints
- [ ] Set up cron jobs (see scripts/)
- [ ] Run `npx prisma migrate deploy`
- [ ] Seed initial data if needed

### Docker (optional)
```bash
docker build -t market-ai .
docker run -p 3000:3000 --env-file .env market-ai
```

---

## 📝 Legal Notes

> ⚠️ **Disclaimer**: This is a starter scaffold, not legal advice.
> Expand compliance rules per state with legal counsel before launch.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

<p align="center">
  Built with ❤️ for the land investment community
</p>
