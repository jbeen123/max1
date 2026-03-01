#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EDGE_SECRET="${EDGE_SHARED_SECRET:-}"

if [[ -z "$EDGE_SECRET" ]]; then
  echo "EDGE_SHARED_SECRET is required"
  exit 1
fi

curl -fsS -X POST "$BASE_URL/api/admin/ops/run-maintenance" -H "x-edge-secret: $EDGE_SECRET" >/dev/null
curl -fsS -X POST "$BASE_URL/api/admin/ops/attest-audit" -H "x-edge-secret: $EDGE_SECRET" >/dev/null
curl -fsS -X POST "$BASE_URL/api/admin/ops/attest-audit/upload" -H "x-edge-secret: $EDGE_SECRET" >/dev/null

echo "phase12 maintenance + attestation completed"
