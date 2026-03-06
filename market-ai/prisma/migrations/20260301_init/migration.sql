-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'UNDER_CONTRACT', 'ASSIGNED', 'CLOSED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('SUBMITTED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "KycProvider" AS ENUM ('PERSONA', 'STRIPE_IDENTITY', 'SUMSUB');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ESignProvider" AS ENUM ('DOCUSIGN', 'DROPBOX_SIGN');

-- CreateEnum
CREATE TYPE "EnvelopeStatus" AS ENUM ('SENT', 'COMPLETED', 'DECLINED', 'VOIDED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'PAID', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "UploadJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "PolicyApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL,
    "state" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "parcelId" TEXT,
    "zoning" TEXT,
    "lotSizeAcres" DOUBLE PRECISION,
    "askingPrice" INTEGER NOT NULL,
    "assignmentAllowed" BOOLEAN NOT NULL DEFAULT false,
    "disclosures" JSONB,
    "moderationNotes" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'SUBMITTED',
    "counterAmount" INTEGER,
    "counterMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "KycProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESignEnvelope" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "provider" "ESignProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "sellerEmail" TEXT NOT NULL,
    "status" "EnvelopeStatus" NOT NULL DEFAULT 'SENT',
    "signingUrl" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ESignEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealTransaction" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "stripeIntentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "TransactionStatus" NOT NULL DEFAULT 'REQUIRES_PAYMENT_METHOD',
    "clientSecret" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripePayoutId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT,
    "payload" JSONB,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "prevHash" TEXT,
    "hash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdById" TEXT,
    "consumedById" TEXT,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "lastSentAt" TIMESTAMP(3),
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitEvent" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteNonceUse" (
    "id" TEXT NOT NULL,
    "nonceKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteNonceUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAttestation" (
    "id" TEXT NOT NULL,
    "tipHash" TEXT NOT NULL,
    "logCount" INTEGER NOT NULL,
    "storagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditAttestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsLock" (
    "key" TEXT NOT NULL,
    "lockedUntil" TIMESTAMP(3) NOT NULL,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsLock_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "UploadJob" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB,
    "status" "UploadJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "runAfter" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "errorCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueCircuitState" (
    "queueKey" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMP(3),
    "openUntil" TIMESTAMP(3),
    "failCountWindow" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueCircuitState_pkey" PRIMARY KEY ("queueKey")
);

-- CreateTable
CREATE TABLE "QueueCircuitEvent" (
    "id" TEXT NOT NULL,
    "queueKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueCircuitEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueuePolicy" (
    "queueKey" TEXT NOT NULL,
    "failThreshold" INTEGER NOT NULL DEFAULT 5,
    "openMs" INTEGER NOT NULL DEFAULT 300000,
    "alertWebhook" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueuePolicy_pkey" PRIMARY KEY ("queueKey")
);

-- CreateTable
CREATE TABLE "QueuePolicyApproval" (
    "id" TEXT NOT NULL,
    "queueKey" TEXT NOT NULL,
    "requestedById" TEXT,
    "approvedById" TEXT,
    "status" "PolicyApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestPayload" JSONB NOT NULL,
    "note" TEXT,
    "requiredVotes" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "QueuePolicyApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueuePolicyApprovalVote" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueuePolicyApprovalVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookNonceUse" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookNonceUse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KycSession_externalId_key" ON "KycSession"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "ESignEnvelope_externalId_key" ON "ESignEnvelope"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "DealTransaction_stripeIntentId_key" ON "DealTransaction"("stripeIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutAccount_userId_key" ON "PayoutAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutAccount_stripeAccountId_key" ON "PayoutAccount"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_stripePayoutId_key" ON "Payout"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_source_eventKey_key" ON "WebhookEvent"("source", "eventKey");

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");

-- CreateIndex
CREATE INDEX "RateLimitEvent_scope_key_createdAt_idx" ON "RateLimitEvent"("scope", "key", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "InviteNonceUse_nonceKey_key" ON "InviteNonceUse"("nonceKey");

-- CreateIndex
CREATE INDEX "QueueCircuitEvent_queueKey_createdAt_idx" ON "QueueCircuitEvent"("queueKey", "createdAt");

-- CreateIndex
CREATE INDEX "QueuePolicyApproval_status_expiresAt_idx" ON "QueuePolicyApproval"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "QueuePolicyApprovalVote_approvalId_voterId_key" ON "QueuePolicyApprovalVote"("approvalId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookNonceUse_scope_nonce_key" ON "WebhookNonceUse"("scope", "nonce");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycSession" ADD CONSTRAINT "KycSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ESignEnvelope" ADD CONSTRAINT "ESignEnvelope_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealTransaction" ADD CONSTRAINT "DealTransaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutAccount" ADD CONSTRAINT "PayoutAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueuePolicyApprovalVote" ADD CONSTRAINT "QueuePolicyApprovalVote_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "QueuePolicyApproval"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

