-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LAND_DEAL_IDENTIFIED';
ALTER TYPE "NotificationType" ADD VALUE 'LAND_DEAL_CLAIMED';
ALTER TYPE "NotificationType" ADD VALUE 'LAND_OFFER_GENERATED';
ALTER TYPE "NotificationType" ADD VALUE 'BUYER_MATCH_FOUND';
ALTER TYPE "NotificationType" ADD VALUE 'SCAN_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'CASH_BUYER_VERIFIED';
