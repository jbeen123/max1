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
   npx prisma migrate dev --name phase20_quorum_approval_webhook_replay
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

## Next production tasks

- Add strict separation of requester/approver roles by team/group.
- Add automatic expiration for stale pending approvals.
- Add rotating webhook signing keys with key-id headers.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
