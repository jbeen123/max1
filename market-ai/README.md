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

## Next production tasks

- Add explicit team/group entities in DB (instead of env-based allowlists).
- ✅ Added dedicated scheduler-friendly endpoint to expire stale approvals proactively:
  - `POST /api/admin/ops/queue/policy-approvals/expire`
  - Supports ADMIN auth or trusted edge (`x-edge-secret`), and uses an ops lock to avoid concurrent runs.
  - Helper script: `scripts/cron-phase21-expire-approvals.sh`
  - Example crontab (hourly):
    ```cron
    0 * * * * cd /home/jahffy/.openclaw/workspace/market-ai && EDGE_SHARED_SECRET='your-secret' BASE_URL='http://localhost:3000' ./scripts/cron-phase21-expire-approvals.sh >> /tmp/marketai-phase21-cron.log 2>&1
    ```
- Add admin UI controls for webhook key rotation + health checks.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
