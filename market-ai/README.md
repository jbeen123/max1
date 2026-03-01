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
   npx prisma migrate dev --name phase19_policy_approval_signed_alerts
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## What phase 19 added

- **Policy edit approval workflow**
  - New model: `QueuePolicyApproval`
  - Policy edits can be submitted for approval instead of immediate apply
  - Endpoints:
    - `GET/POST /api/admin/ops/queue/policy-approvals`
    - `POST /api/admin/ops/queue/policy-approvals/:id/approve`
    - `POST /api/admin/ops/queue/policy-approvals/:id/reject`
  - `PATCH /api/admin/ops/queue/config` now submits approval by default
- **Signed queue alerts**
  - Alert payloads now support HMAC signature header:
    - `x-marketai-signature`
  - Signature secret: `QUEUE_ALERT_SIGNING_SECRET`
- **Queue policy governance UI**
  - `/admin/ops/queue` now shows pending approvals with approve/reject actions
  - Policy saves now submit approval requests

## API highlights

- `GET/PATCH /api/admin/ops/queue/config`
- `GET/POST /api/admin/ops/queue/policy-approvals`
- `POST /api/admin/ops/queue/policy-approvals/:id/approve`
- `POST /api/admin/ops/queue/policy-approvals/:id/reject`
- `POST /api/admin/ops/queue/alerts`

## Data model additions (phase 19)

- `QueuePolicyApproval`
- `PolicyApprovalStatus` enum

## Env vars (phase 19)

- `QUEUE_ALERT_SIGNING_SECRET`

(Existing queue policy/alert vars still apply.)

## Next production tasks

- Add multi-admin quorum approvals (2-of-N) for policy activation.
- Add approver identity constraints (requester cannot self-approve).
- Add signed alert replay timestamp + nonce validation on receiver side.

## Legal notes

- This is a starter scaffold, not legal advice.
- Expand compliance rules per state with legal counsel before launch.
