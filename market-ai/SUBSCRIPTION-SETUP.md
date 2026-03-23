# Market-AI Subscription Setup Guide

## Overview
Market-AI now supports paid subscriptions:
- **Price:** $399/month
- **Trial:** 3 days free
- **Payment:** Stripe integration

## Quick Setup

### 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Go to **Products** → **Create product**
   - Name: "Market-AI Pro"
   - Description: "Unlimited listings, messaging, and priority approval"
5. Add pricing:
   - **Price:** $399.00
   - **Billing:** Recurring, Monthly
   - **Trial period:** 3 days
6. Copy the **Price ID** (starts with `price_`)

### 2. Environment Variables

Add to your `.env` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App URL (for webhooks)
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Database Migration

```bash
# Add subscription tables to schema
# Copy models from prisma/schema-subscription.prisma to schema.prisma

# Generate migration
npx prisma migrate dev --name add_subscriptions

# Generate client
npx prisma generate
```

### 4. Stripe Webhook Setup

**Local Development:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/subscription/webhook
```

**Production:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET`

### 5. Test the Flow

1. Go to `/pricing`
2. Click "Start Free Trial"
3. Complete Stripe checkout (use test card: `4242 4242 4242 4242`)
4. Check subscription status in database:
   ```bash
   npx prisma studio
   ```

## Subscription Features

### Free Tier
- Browse listings (view-only)
- Create 1 listing
- No messaging
- Standard approval time

### Pro Tier ($399/month)
- ✅ Unlimited listings
- ✅ Direct messaging
- ✅ Priority approval (24h)
- ✅ Verified Pro badge
- ✅ Lead analytics
- ✅ API access (future)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscription/checkout` | POST | Create checkout session |
| `/api/subscription/status` | GET | Get current subscription status |
| `/api/subscription/webhook` | POST | Stripe webhook handler |

## Components

### PaywallModal
```tsx
import { PaywallModal } from "@/components/SubscriptionComponents";

<PaywallModal 
  feature="Messaging" 
  description="Send messages to buyers and sellers"
  onClose={() => setShowPaywall(false)}
/>
```

### TrialBanner
```tsx
import { TrialBanner } from "@/components/SubscriptionComponents";

<TrialBanner daysLeft={2} />
```

### SubscriptionBadge
```tsx
import { SubscriptionBadge } from "@/components/SubscriptionComponents";

<SubscriptionBadge status="pro" />  // "pro" | "trial" | "free"
```

## Access Control

Use the subscription helpers:

```typescript
import { getUserSubscription, canMessage, canCreateListing } from "@/lib/subscription";

// Check subscription
const sub = await getUserSubscription(userId);
if (sub.isPro) {
  // Allow Pro features
}

// Check messaging
if (canMessage(sub)) {
  // Allow messaging
}

// Check listing creation
const { allowed, reason } = await canCreateListing(userId);
if (!allowed) {
  // Show paywall with reason
}
```

## Testing with Stripe

### Test Cards

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 0341` | Requires 3D Secure |

### Test Clock (Time Travel)

1. Go to Stripe Dashboard → Subscriptions
2. Click "Test clocks"
3. Create a test clock
4. Create a customer in the test clock
5. Simulate trial ending, payment failing, etc.

## Common Issues

### Webhook not working
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure endpoint URL is publicly accessible
- Check webhook events are selected

### Subscription not updating
- Check webhook is receiving events
- Look at server logs for webhook errors
- Verify `stripeSubscriptionId` is saved correctly

### Trial not working
- Ensure `trial_period_days: 3` is set in checkout
- Check `trialEndsAt` is populated in database
- Verify trial hasn't expired

## Going Live

1. Switch to Stripe **Live mode**
2. Update keys to live keys (`sk_live_`, `pk_live_`)
3. Create live product and price
4. Update `STRIPE_PRICE_ID` with live price ID
5. Update webhook endpoint to production URL
6. Test with small amount first

## Revenue Tracking

View payments in database:
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as payments,
  SUM(amount)/100 as revenue
FROM "Payment"
WHERE status = 'SUCCEEDED'
GROUP BY month
ORDER BY month DESC;
```

## Support

- Stripe Docs: https://stripe.com/docs
- Test mode: https://stripe.com/docs/testing
- Webhooks: https://stripe.com/docs/webhooks
