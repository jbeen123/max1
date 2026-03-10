import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  return db.notification.create({ data: params });
}

export async function createBulkNotifications(
  notifications: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
  }[],
) {
  if (notifications.length === 0) return { count: 0 };
  return db.notification.createMany({ data: notifications });
}

export async function getUserNotifications(userId: string, opts?: { unreadOnly?: boolean; limit?: number }) {
  return db.notification.findMany({
    where: {
      userId,
      ...(opts?.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 50,
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return db.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

// ── Convenience helpers for common events ─────────────────────────────────

export async function notifyOfferReceived(sellerId: string, propertyTitle: string, amount: number, offerId: string) {
  return createNotification({
    userId: sellerId,
    type: "OFFER_RECEIVED",
    title: "New Offer Received",
    body: `You received a $${amount.toLocaleString()} offer on "${propertyTitle}"`,
    link: `/deal-room?offer=${offerId}`,
  });
}

export async function notifyOfferAccepted(buyerId: string, propertyTitle: string) {
  return createNotification({
    userId: buyerId,
    type: "OFFER_ACCEPTED",
    title: "Offer Accepted!",
    body: `Your offer on "${propertyTitle}" has been accepted`,
    link: "/deal-room",
  });
}

export async function notifyOfferRejected(buyerId: string, propertyTitle: string) {
  return createNotification({
    userId: buyerId,
    type: "OFFER_REJECTED",
    title: "Offer Declined",
    body: `Your offer on "${propertyTitle}" was declined`,
    link: "/deal-room",
  });
}

export async function notifyOfferCountered(buyerId: string, propertyTitle: string, counterAmount: number) {
  return createNotification({
    userId: buyerId,
    type: "OFFER_COUNTERED",
    title: "Counter Offer Received",
    body: `Seller countered with $${counterAmount.toLocaleString()} on "${propertyTitle}"`,
    link: "/deal-room",
  });
}

export async function notifyListingApproved(sellerId: string, propertyTitle: string) {
  return createNotification({
    userId: sellerId,
    type: "LISTING_APPROVED",
    title: "Listing Approved",
    body: `"${propertyTitle}" is now live on the marketplace`,
    link: "/search",
  });
}

export async function notifyListingRejected(sellerId: string, propertyTitle: string, reason?: string) {
  return createNotification({
    userId: sellerId,
    type: "LISTING_REJECTED",
    title: "Listing Needs Changes",
    body: reason ? `"${propertyTitle}" was flagged: ${reason}` : `"${propertyTitle}" was not approved`,
    link: "/dashboard",
  });
}

export async function notifyKycStatus(userId: string, approved: boolean) {
  return createNotification({
    userId,
    type: approved ? "KYC_VERIFIED" : "KYC_REJECTED",
    title: approved ? "Identity Verified" : "Identity Verification Failed",
    body: approved
      ? "Your identity has been verified. You can now transact on the platform."
      : "Your identity verification was not successful. Please try again.",
    link: "/compliance",
  });
}
