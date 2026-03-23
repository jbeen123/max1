# 🌳 Market-AI Directory Tree

```
market-ai/
├── 📱 app/                                    # Next.js App Router
│   ├── 📄 layout.tsx                         # Root layout
│   ├── 📄 page.tsx                           # Landing page
│   ├── 📄 globals.css                        # Global styles
│   │
│   ├── 📁 admin/                             # Admin dashboard
│   │   ├── 📁 audit/                         # Audit logs
│   │   ├── 📁 invites/                       # Invite management
│   │   ├── 📁 ops/                           # Operations panel
│   │   └── 📁 users/                         # User management
│   │
│   ├── 📁 api/                               # API Routes
│   │   ├── 📁 admin/                         # Admin APIs
│   │   ├── 📁 auth/                          # Authentication
│   │   │   ├── 📁 [...nextauth]/             # NextAuth handler
│   │   │   ├── 📁 invite/consume/            # Invite redemption
│   │   │   ├── 📁 login/                     # Login endpoint
│   │   │   ├── 📁 logout/                    # Logout endpoint
│   │   │   ├── 📁 me/                        # Current user
│   │   │   └── 📁 session/                   # Session management
│   │   ├── 📁 contracts/                     # Contract APIs
│   │   ├── 📁 conversations/                 # Messaging APIs
│   │   │   └── 📁 [id]/messages/             # Message endpoints
│   │   ├── 📁 esign/                         # E-signature
│   │   │   ├── 📁 envelope/                  # DocuSign envelopes
│   │   │   └── 📁 webhook/                   # Webhook handler
│   │   ├── 📁 health/                        # Health checks
│   │   ├── 📁 kyc/                           # KYC verification
│   │   ├── 📁 land-scanner/                  # Land scanner APIs
│   │   │   ├── 📁 buyer-matches/             # Buyer matching
│   │   │   ├── 📁 cash-buyers/               # Cash buyer list
│   │   │   ├── 📁 deals/                     # Deal management
│   │   │   │   └── 📁 [id]/                  # Individual deals
│   │   │   ├── 📁 matches/                   # Property matches
│   │   │   ├── 📁 offer-templates/           # Offer templates
│   │   │   ├── 📁 offers/                    # Offers
│   │   │   ├── 📁 scan-jobs/                 # Scan jobs
│   │   │   ├── 📁 stats/                     # Statistics
│   │   │   └── 📁 valuations/                # AI valuations
│   │   ├── 📁 matches/                       # Matching APIs
│   │   ├── 📁 moderation/                    # Content moderation
│   │   ├── 📁 notifications/                 # Notifications
│   │   │   ├── 📁 read-all/                  # Mark all read
│   │   │   └── 📁 [id]/read/                 # Mark one read
│   │   ├── 📁 offers/                        # Offer APIs
│   │   ├── 📁 payments/                      # Stripe payments
│   │   │   ├── 📁 connect-account/             # Connect accounts
│   │   │   ├── 📁 intent/                      # Payment intents
│   │   │   ├── 📁 payout/                      # Payouts
│   │   │   └── 📁 webhook/                   # Webhook handler
│   │   ├── 📁 properties/                    # Property CRUD
│   │   └── 📁 public-records/                # Public records
│   │
│   ├── 📁 compliance/                          # Compliance center
│   ├── 📁 contracts/                         # Contract management
│   ├── 📁 dashboard/                           # User dashboard
│   ├── 📁 deal-room/                           # Deal negotiations
│   ├── 📁 investors/                           # Investor profiles
│   ├── 📁 land-scanner/                        # AI Land Scanner
│   │   ├── 📁 cash-buyers/                     # Cash buyers page
│   │   ├── 📁 deals/                           # Deals page
│   │   │   └── 📁 [id]/                        # Deal detail
│   │   ├── 📁 matches/                         # Matches page
│   │   └── 📁 scan/                            # Scan interface
│   ├── 📁 login/                               # Login page
│   ├── 📁 matches/                             # Property matches
│   ├── 📁 messages/                            # Messaging UI
│   ├── 📁 notifications/                         # Notifications UI
│   ├── 📁 property/                              # Property details
│   │   └── 📁 [id]/                              # Individual property
│   ├── 📁 public-info/                         # Public information
│   ├── 📁 public-records/                      # Public records
│   │   └── 📁 [id]/                              # Record details
│   ├── 📁 search/                              # Property search
│   └── 📁 submit/                              # Submit property
│
├── 🧩 components/                            # Shared Components
│   ├── 📄 AuthStatus.tsx                       # Auth status
│   ├── 📄 ComplianceBadge.tsx                  # Compliance badge
│   ├── 📄 IntegrationsPanel.tsx                # Integrations
│   ├── 📄 KycPanel.tsx                         # KYC panel
│   ├── 📄 ModerationQueue.tsx                  # Moderation
│   ├── 📄 NotificationBell.tsx                 # Notifications
│   ├── 📄 OpsActions.tsx                       # Operations
│   ├── 📄 Providers.tsx                        # Context providers
│   └── 📄 README.md                            # Component docs
│
├── 🔧 lib/                                     # Business Logic
│   ├── 📄 auth.ts                              # Auth helpers
│   ├── 📄 auth-edge.ts                         # Edge auth
│   ├── 📄 authjs.ts                            # Auth.js config
│   ├── 📄 db.ts                                # Database
│   ├── 📄 notify.ts                            # Notifications
│   ├── 📄 rate-limit.ts                        # Rate limiting
│   ├── 📄 webhooks.ts                          # Webhooks
│   │
│   ├── 📁 ai/                                  # AI Services
│   │   ├── 📄 buyer-matching.ts                # Buyer matching
│   │   ├── 📄 land-scanner.ts                  # Land scanner
│   │   ├── 📄 land-valuation.ts                # Valuation
│   │   ├── 📄 lead-scoring.ts                  # Lead scoring
│   │   ├── 📄 matching.ts                    # Matching algo
│   │   └── 📄 offer-generator.ts               # Offer generation
│   │
│   ├── 📁 alerts/                              # Alert system
│   │   └── 📄 queue-alert.ts                   # Queue alerts
│   │
│   ├── 📁 contracts/                           # Contracts
│   │   ├── 📄 clauses.ts                       # Clauses
│   │   ├── 📄 compliance-check.ts            # Compliance
│   │   └── 📄 templates.ts                     # Templates
│   │
│   ├── 📁 integrations/                        # Integrations
│   │
│   ├── 📁 ops/                                 # Operations
│   │   ├── 📄 lock.ts                          # Distributed lock
│   │   └── 📄 maintenance.ts                   # Maintenance mode
│   │
│   ├── 📁 public-records/                      # Public records
│   │
│   ├── 📁 queue/                               # Job Queue
│   │   ├── 📄 policy.ts                        # Queue policies
│   │   ├── 📄 policy-access.ts                 # Access control
│   │   ├── 📄 policy-approval-expiry.ts        # Expiry logic
│   │   └── 📄 upload-queue.ts                  # Upload queue
│   │
│   ├── 📁 security/                            # Security
│   │   ├── 📄 signed-invite.ts                 # Signed invites
│   │   ├── 📄 webhook-keys.ts                  # Webhook keys
│   │   ├── 📄 webhook-signing.ts               # Request signing
│   │   └── 📄 webhook-verify.ts                # Verification
│   │
│   └── 📁 storage/                             # File storage
│
├── 🗄️ prisma/                                  # Database
│   ├── 📄 schema.prisma                        # Schema definition
│   └── 📁 migrations/                            # Migrations
│       ├── 📁 20260301_init/
│       ├── 📁 20260303_phase21_policy_expiry/
│       ├── 📁 20260310034551_ai_matching/
│       ├── 📁 20260310141022_phase22_teams/
│       ├── 📁 20260310184452_phase23_notifications/
│       ├── 📁 20260311021233_phase24_contact_info/
│       ├── 📁 20260315232308_add_ai_land_scanner/
│       └── 📁 20260315233513_add_land_scanner_notifications/
│
├── 🔨 scripts/                                 # Automation
│   ├── 📄 cron-phase12.sh                      # Phase 1-2 cron
│   ├── 📄 cron-phase21-expire-approvals.sh     # Expiry cron
│   ├── 📄 seed-phase24.js                      # Phase 24 seed
│   ├── 📄 seed-realistic.js                    # Realistic seed
│   ├── 📄 worker-phase14.sh                    # Background worker
│   └── 📄 README.md                            # Scripts docs
│
├── 📖 docs/                                    # Documentation
│   ├── 📁 architecture/                        # Architecture docs
│   ├── 📁 api/                                 # API docs
│   └── 📁 deployment/                          # Deployment guides
│
├── 📁 types/                                   # Global Types
│
├── 📁 tests/                                   # Testing
│   ├── 📁 unit/                                # Unit tests
│   ├── 📁 e2e/                                 # E2E tests
│   └── 📁 integration/                         # Integration tests
│
├── ⚙️ Config Files
│   ├── 📄 middleware.ts                        # Next.js middleware
│   ├── 📄 next.config.ts                       # Next.js config
│   ├── 📄 tailwind.config.ts                   # Tailwind config
│   ├── 📄 postcss.config.js                    # PostCSS config
│   ├── 📄 tsconfig.json                       # TypeScript config
│   ├── 📄 next-env.d.ts                       # Next.js types
│   └── 📄 package.json                        # Dependencies
│
├── 🔐 Environment
│   ├── 📄 .env                                 # Environment vars
│   ├── 📄 .env.example                        # Example env
│   └── 📄 .gitignore                          # Git ignore
│
├── 📄 PROJECT_STRUCTURE.md                    # Structure guide
├── 📄 TREE.md                                  # This file
└── 📄 README.md                                # Main readme
```

## 🏷️ Color Legend

| Icon | Meaning |
|------|---------|
| 📱 | Application code |
| 🧩 | UI Components |
| 🔧 | Utilities & Logic |
| 🗄️ | Database |
| 🔨 | Scripts & Automation |
| 📖 | Documentation |
| ⚙️ | Configuration |
| 🔐 | Environment/Security |
| 📄 | File |
| 📁 | Directory |
