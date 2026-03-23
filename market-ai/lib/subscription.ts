// Subscription module disabled for MVP - no subscription model in schema

export interface SubscriptionCheck {
  isActive: boolean;
  isTrialing: boolean;
  isPro: boolean;
  trialDaysLeft: number | null;
  status: string | null;
  currentPeriodEnd: Date | null;
}

// Always return free user status (MVP has no paid features)
export async function getUserSubscription(userId: string): Promise<SubscriptionCheck> {
  return {
    isActive: false,
    isTrialing: false,
    isPro: false,
    trialDaysLeft: null,
    status: null,
    currentPeriodEnd: null,
  };
}

export function canMessage(subscription: SubscriptionCheck): boolean {
  return true; // MVP: everyone can message
}

export async function canCreateListing(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  return { allowed: true }; // MVP: everyone can create listings
}

export function getSubscriptionFeatures(subscription: SubscriptionCheck) {
  return {
    canMessage: true,
    canExport: false,
    canAccessApi: false,
    maxListings: Infinity,
    hasPrioritySupport: false,
    hasVerifiedBadge: false,
  };
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export const SUBSCRIPTION_PRICE = 39900;
export const TRIAL_DAYS = 3;
