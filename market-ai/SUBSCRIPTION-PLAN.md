# Market-AI Subscription Implementation Plan

## Overview
- **Price:** $399/month
- **Trial:** 3 days free
- **Payment:** Stripe integration

## Subscription Tiers

### Free Tier (Default)
- Browse listings (view-only)
- Create 1 listing (pending approval)
- No messaging
- No contact info visibility

### Pro Tier ($399/month)
- Unlimited listings
- Priority approval (faster review)
- Full messaging access
- Contact seller/buyer directly
- "Verified Pro" badge
- Analytics dashboard
- Export leads
- API access (future)

## Database Schema Additions

```prisma
model Subscription {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  
  stripeCustomerId  String    @unique
  stripeSubscriptionId String @unique
  
  status            SubscriptionStatus @default(TRIALING)
  trialEndsAt       DateTime?
  currentPeriodStart DateTime
  currentPeriodEnd  DateTime
  
  cancelAtPeriodEnd Boolean   @default(false)
  canceledAt        DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Payment {
  id                String   @id @default(cuid())
  userId            String
  subscriptionId    String?
  
  stripePaymentIntentId String @unique
  amount            Int      // in cents
  currency          String   @default("usd")
  status            PaymentStatus
  
  createdAt         DateTime @default(now())
}

enum SubscriptionStatus {
  TRIALING      // 3-day free trial
  ACTIVE        // Paid subscription
  PAST_DUE      // Payment failed
  CANCELED      // User canceled
  UNPAID        // Payment failed multiple times
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}
```

## Stripe Setup

### Required Stripe Products
1. **Product:** Market-AI Pro Subscription
   - **Price:** $399.00 USD / month
   - **Billing:** Recurring monthly
   - **Trial:** 3 days

### Stripe Webhook Events to Handle
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`

## API Routes to Add

```
/api/subscription/
├── checkout/route.ts          # Create checkout session
├── portal/route.ts            # Customer portal (manage billing)
├── webhook/route.ts           # Stripe webhook handler
└── status/route.ts            # Get current subscription status
```

## UI Components to Add

### Public Pages
- `/pricing` - Pricing page with CTA
- `/subscribe` - Checkout redirect
- `/subscribe/success` - Post-checkout success
- `/subscribe/cancel` - Checkout canceled

### Protected Components
- `SubscriptionBadge` - Show Pro badge on profile
- `PaywallModal` - Block features for free users
- `TrialBanner` - Show trial countdown
- `BillingSettings` - Manage subscription

## Access Control Logic

### Middleware Updates
```typescript
// Check subscription status for protected routes
const PROTECTED_ROUTES = ['/messages', '/dashboard/create', '/api/conversations'];

// Free users can:
// - View /search
// - View /property/[id] (limited info)
// - Create 1 listing

// Pro users can:
// - Everything
```

### Feature Gates
```typescript
// lib/subscription.ts
export function canMessage(user: User): boolean {
  return user.subscription?.status === 'ACTIVE' || 
         (user.subscription?.status === 'TRIALING' && new Date() < user.subscription.trialEndsAt);
}

export function canCreateListing(user: User): boolean {
  const listingCount = user.properties.length;
  const isPro = user.subscription?.status === 'ACTIVE';
  return isPro || listingCount < 1; // Free users get 1 listing
}

export function getTrialDaysLeft(user: User): number | null {
  if (user.subscription?.status !== 'TRIALING') return null;
  const diff = user.subscription.trialEndsAt.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
```

## Implementation Steps

### Phase 1: Stripe Setup
1. Create Stripe account
2. Create Product + Price ($399/month, 3-day trial)
3. Get API keys (test mode first)
4. Configure webhook endpoint

### Phase 2: Database
1. Add Subscription and Payment tables
2. Run migration
3. Update User model relations

### Phase 3: API Routes
1. Create checkout session endpoint
2. Create webhook handler
3. Create customer portal endpoint
4. Create status check endpoint

### Phase 4: UI
1. Build pricing page
2. Add subscription badge to nav
3. Create paywall modals
4. Add billing settings page

### Phase 5: Access Control
1. Update middleware
2. Add feature gates to components
3. Block API routes for free users
4. Show upgrade prompts

### Phase 6: Testing
1. Test trial signup
2. Test payment flow
3. Test cancellation
4. Test access control

## Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_... # $399/month price ID

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Pricing Page Copy

**Headline:** Unlock Full Access to Market-AI

**Price:** $399/month

**Includes:**
- ✅ Unlimited property listings
- ✅ Direct messaging with buyers/sellers
- ✅ Priority listing approval
- ✅ Verified Pro badge
- ✅ Lead analytics & exports
- ✅ Cancel anytime

**Trial:** Start with 3 days free. No credit card required.

**CTA:** Start Free Trial

## Post-Implementation Checklist

- [ ] Stripe account created
- [ ] Product and price configured
- [ ] Webhook endpoint live
- [ ] Database migrated
- [ ] Checkout flow tested
- [ ] Trial logic working
- [ ] Access control implemented
- [ ] Pricing page live
- [ ] Terms of service updated
- [ ] Refund policy documented
