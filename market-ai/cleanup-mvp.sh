#!/bin/bash
# Market-AI MVP Cleanup Script
# Run this from the market-ai directory
# WARNING: This deletes files permanently. Review before running.

echo "🧹 Starting MVP Cleanup..."
echo "Working directory: $(pwd)"
echo ""

# Confirm before proceeding
read -p "This will delete non-MVP files. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "❌ Deleting AI Features..."
rm -rf lib/ai/
echo "  ✓ lib/ai/"

echo ""
echo "❌ Deleting Complex Queue System..."
rm -rf lib/queue/
rm -rf lib/alerts/
rm -rf lib/ops/
echo "  ✓ lib/queue/"
echo "  ✓ lib/alerts/"
echo "  ✓ lib/ops/"

echo ""
echo "❌ Deleting Advanced Security (keep basic auth)..."
rm -rf lib/security/
echo "  ✓ lib/security/"

echo ""
echo "❌ Deleting Admin Queue Operations..."
rm -rf app/api/admin/ops/
echo "  ✓ app/api/admin/ops/"

echo ""
echo "❌ Deleting Land Scanner Feature..."
rm -rf app/land-scanner/
rm -rf app/api/land-scanner/
echo "  ✓ app/land-scanner/"
echo "  ✓ app/api/land-scanner/"

echo ""
echo "❌ Deleting Complex Admin UI..."
rm -rf app/compliance/
rm -rf app/deal-room/
rm -rf app/investors/
rm -rf app/matches/
rm -rf app/public-records/
echo "  ✓ app/compliance/"
echo "  ✓ app/deal-room/"
echo "  ✓ app/investors/"
echo "  ✓ app/matches/"
echo "  ✓ app/public-records/"

echo ""
echo "❌ Deleting Non-MVP API Routes..."
rm -rf app/api/contracts/
rm -rf app/api/esign/
rm -rf app/api/kyc/
rm -rf app/api/payments/
rm -rf app/api/public-records/
rm -rf app/api/offers/           # Optional: uncomment if you want simple offers
echo "  ✓ app/api/contracts/"
echo "  ✓ app/api/esign/"
echo "  ✓ app/api/kyc/"
echo "  ✓ app/api/payments/"
echo "  ✓ app/api/public-records/"
echo "  ✓ app/api/offers/"

echo ""
echo "❌ Deleting Unnecessary Components..."
rm -f components/ComplianceBadge.tsx
rm -f components/IntegrationsPanel.tsx
rm -f components/KycPanel.tsx
rm -f components/ModerationQueue.tsx
rm -f components/OpsActions.tsx
echo "  ✓ components/ComplianceBadge.tsx"
echo "  ✓ components/IntegrationsPanel.tsx"
echo "  ✓ components/KycPanel.tsx"
echo "  ✓ components/ModerationQueue.tsx"
echo "  ✓ components/OpsActions.tsx"

echo ""
echo "❌ Deleting Automation Scripts..."
rm -f scripts/cron-phase*.sh
rm -f scripts/cron-phase21-expire-approvals.sh
rm -f scripts/worker-phase14.sh
echo "  ✓ scripts/cron-phase*.sh"
echo "  ✓ scripts/worker-phase14.sh"

echo ""
echo "📊 Cleanup Summary:"
echo "  Files deleted. Run 'npm run build' to verify."
echo ""
echo "📝 Next Steps:"
echo "  1. Replace schema.prisma with the MVP version"
echo "  2. Replace app/admin/page.tsx with simplified version"
echo "  3. Run: npx prisma generate"
echo "  4. Run: npx prisma migrate dev --name mvp_cleanup"
echo "  5. Run: npm run build"
echo ""
echo "✅ Cleanup complete!"
