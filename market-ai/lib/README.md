# 🔧 Lib Directory

Business logic, utilities, and shared code.

## Structure

### Core (`/`)
Authentication, database, and foundational utilities.

| File | Purpose |
|------|---------|
| `auth.ts` | Authentication helpers |
| `auth-edge.ts` | Edge runtime auth |
| `authjs.ts` | Auth.js config |
| `db.ts` | Database connection |
| `notify.ts` | Notifications |
| `rate-limit.ts` | Rate limiting |
| `webhooks.ts` | Webhook handling |

### AI (`ai/`)
Machine learning and AI services:
- `buyer-matching.ts` - Match buyers to properties
- `land-scanner.ts` - Scan land for opportunities
- `land-valuation.ts` - AI property valuation
- `lead-scoring.ts` - Score potential leads
- `matching.ts` - General matching algorithms
- `offer-generator.ts` - Generate offers

### Contracts (`contracts/`)
Contract management:
- `clauses.ts` - Contract clauses
- `compliance-check.ts` - Compliance validation
- `templates.ts` - Contract templates

### Queue (`queue/`)
Background job processing:
- `policy.ts` - Queue policies
- `policy-access.ts` - Access control
- `policy-approval-expiry.ts` - Approval expiration
- `upload-queue.ts` - File upload processing

### Security (`security/`)
Security utilities:
- `signed-invite.ts` - Invite signing
- `webhook-keys.ts` - Webhook key management
- `webhook-signing.ts` - Request signing
- `webhook-verify.ts` - Signature verification

### Ops (`ops/`)
Operations tools:
- `lock.ts` - Distributed locking
- `maintenance.ts` | Maintenance mode

### Other Folders
- `alerts/` - Alert system
- `integrations/` - Third-party integrations
- `public-records/` - Public records handling
- `storage/` - File storage

## Conventions
- Use camelCase for file names
- Export functions, not classes
- Keep functions pure when possible
- Document complex logic
