#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EDGE_SECRET="${EDGE_SHARED_SECRET:-}"

if [[ -z "$EDGE_SECRET" ]]; then
  echo "EDGE_SHARED_SECRET is required"
  exit 1
fi

curl -fsS -X POST "$BASE_URL/api/admin/ops/queue/policy-approvals/expire" \
  -H "x-edge-secret: $EDGE_SECRET" >/dev/null

echo "phase21 stale policy approvals expiry completed"
