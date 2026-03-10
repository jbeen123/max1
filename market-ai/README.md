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
   npx prisma migrate dev --name phase21_policy_expiry_role_separation_webhook_key_rotation
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 20 added

- **Quorum-based policy approvals (2-of-N style)**
  - New vote model: `QueuePolicyApprovalVote`
  - Approvals now gather votes until `requiredVotes` is reached
  - Policy applies only when quorum is reached
- **Requester cannot self-approve**
  - Approval endpoint now blocks requester from voting approval on their own request
- **Signed alert anti-replay receiver support**
  - New verifier: `lib/security/webhook-verify.ts`
  - New nonce registry model: `WebhookNonceUse`
  - New test receiver endpoint:
    - `POST /api/admin/ops/queue/alerts/test`
  - Verifies timestamp window + signature + nonce replay

## API highlights

- `PATCH /api/admin/ops/queue/config` (submits approval request)
- `GET/POST /api/admin/ops/queue/policy-approvals`
- `POST /api/admin/ops/queue/policy-approvals/:id/approve`
- `POST /api/admin/ops/queue/policy-approvals/:id/reject`
- `POST /api/admin/ops/queue/alerts`
- `POST /api/admin/ops/queue/alerts/test`

## Data model additions (phase 20)

- `QueuePolicyApprovalVote`
- `WebhookNonceUse`
- `QueuePolicyApproval.requiredVotes`

## Env vars (phase 20)

- `QUEUE_POLICY_REQUIRED_VOTES`
- `QUEUE_ALERT_SIGNING_SECRET`

## What phase 21 added

- **Requester/approver separation controls**
  - New env-controlled allowlists:
    - `QUEUE_POLICY_REQUESTER_EMAILS`
    - `QUEUE_POLICY_APPROVER_EMAILS`
    - `QUEUE_POLICY_APPROVER_DOMAINS`
  - Policy change submission and approval/rejection can now be split across different teams/groups.
- **Automatic expiration for stale pending approvals**
  - New `QueuePolicyApproval.expiresAt` field.
  - Pending approvals now auto-expire into `REJECTED` when stale.
  - TTL configurable via `QUEUE_POLICY_APPROVAL_TTL_HOURS`.
- **Rotating webhook signing keys + key-id header support**
  - New keyring env vars:
    - `QUEUE_ALERT_SIGNING_KEYS_JSON`
    - `QUEUE_ALERT_SIGNING_KEY_ID`
  - Alert sender now includes `x-marketai-kid` alongside signature headers.
  - Receiver can verify using key-id-aware keyring lookup.

## What phase 22 added

- **DB-backed policy teams (replaces env allowlists)**
  - New models: `PolicyTeam`, `PolicyTeamMember`
  - Teams have a `role` (`REQUESTER` | `APPROVER`) and optional email or `@domain` members
  - `policy-access.ts` queries DB first; falls back to env vars if no DB teams exist
  - Full CRUD admin API:
    - `GET/POST /api/admin/ops/queue/teams`
    - `GET/PATCH/DELETE /api/admin/ops/queue/teams/:id`
    - `GET/POST /api/admin/ops/queue/teams/:id/members`
    - `DELETE /api/admin/ops/queue/teams/:id/members/:memberId`
- **Webhook key rotation admin UI**
  - New model: `WebhookSigningKey` (kid, secret, isActive, revokedAt)
  - `webhook-keys.ts` now checks DB keys first, env vars as fallback
  - `queue-alert.ts` uses async key lookup (DB-aware)
  - New API endpoints:
    - `GET /api/admin/ops/queue/webhook-keys` — list all keys (secrets never exposed)
    - `POST /api/admin/ops/queue/webhook-keys` — generate + activate new key (secret shown once)
    - `POST /api/admin/ops/queue/webhook-keys/:kid/activate` — switch active key
    - `DELETE /api/admin/ops/queue/webhook-keys/:kid` — revoke a key
    - `GET /api/admin/ops/queue/webhook-health` — live ping + latency check
  - Admin queue page now includes team management UI + key rotation table

## Next production tasks

- ✅ Added dedicated scheduler-friendly endpoint to expire stale approvals proactively:
  - `POST /api/admin/ops/queue/policy-approvals/expire`
  - Supports ADMIN auth or trusted edge (`x-edge-secret`), and uses an ops lock to avoid concurrent runs.
  - Helper script: `scripts/cron-phase21-expire-approvals.sh`
  - Example crontab (hourly):
    ```cron
    0 * * * * cd /home/jahffy/.openclaw/workspace/market-ai && EDGE_SHARED_SECRET='your-secret' BASE_URL='http://localhost:3000' ./scripts/cron-phase21-expire-approvals.sh >> /tmp/marketai-phase21-cron.log 2>&1
    ```
- ✅ Admin UI for webhook key rotation + health checks (phase 22)

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
