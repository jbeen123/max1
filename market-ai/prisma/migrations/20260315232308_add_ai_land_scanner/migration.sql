-- CreateEnum
CREATE TYPE "ValuationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('IDENTIFIED', 'ANALYZED', 'OFFER_GENERATED', 'OFFER_SENT', 'UNDER_CONTRACT', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OfferTemplateType" AS ENUM ('CASH_OFFER', 'ASSIGNMENT_OFFER', 'OPTION_OFFER', 'WHOLESALE_OFFER');

-- CreateEnum
CREATE TYPE "CashBuyerStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "LandValuation" (
    "id" TEXT NOT NULL,
    "publicRecordId" TEXT NOT NULL,
    "estimatedValue" INTEGER NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "comparableSales" JSONB NOT NULL,
    "valueFactors" JSONB NOT NULL,
    "profitPotential" INTEGER,
    "status" "ValuationStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LandValuation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandDeal" (
    "id" TEXT NOT NULL,
    "publicRecordId" TEXT NOT NULL,
    "valuationId" TEXT,
    "askingPrice" INTEGER,
    "estimatedValue" INTEGER NOT NULL,
    "potentialProfit" INTEGER NOT NULL,
    "roiPercent" DOUBLE PRECISION NOT NULL,
    "dealScore" INTEGER NOT NULL,
    "isUnderpriced" BOOLEAN NOT NULL DEFAULT false,
    "isMotivatedSeller" BOOLEAN NOT NULL DEFAULT false,
    "hasClearTitle" BOOLEAN NOT NULL DEFAULT true,
    "titleIssues" JSONB,
    "status" "DealStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "analyzedAt" TIMESTAMP(3),

    CONSTRAINT "LandDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OfferTemplateType" NOT NULL,
    "state" TEXT,
    "county" TEXT,
    "subjectLine" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "terms" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedLandOffer" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "templateId" TEXT,
    "publicRecordId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "offerAmount" INTEGER NOT NULL,
    "earnestDeposit" INTEGER NOT NULL,
    "closingTimeline" INTEGER NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "sentVia" TEXT,
    "responseStatus" TEXT,
    "responseReceivedAt" TIMESTAMP(3),
    "counterAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedLandOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CashBuyer" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "targetStates" TEXT[],
    "targetCounties" TEXT[],
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "preferredZoning" TEXT[],
    "minLotSize" DOUBLE PRECISION,
    "maxLotSize" DOUBLE PRECISION,
    "propertyTypes" TEXT[],
    "proofOfFunds" TEXT,
    "verificationStatus" "CashBuyerStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "totalDealsClosed" INTEGER NOT NULL DEFAULT 0,
    "totalVolume" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "autoNotify" BOOLEAN NOT NULL DEFAULT true,
    "notificationChannels" TEXT[] DEFAULT ARRAY['email']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CashBuyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealBuyerMatch" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "matchReason" JSONB NOT NULL,
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "isInterested" BOOLEAN,
    "respondedAt" TIMESTAMP(3),
    "offerMade" BOOLEAN NOT NULL DEFAULT false,
    "offerAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealBuyerMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandScanJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT,
    "filters" JSONB NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "dealsFound" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'running',
    "results" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,

    CONSTRAINT "LandScanJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LandValuation_publicRecordId_idx" ON "LandValuation"("publicRecordId");

-- CreateIndex
CREATE INDEX "LandValuation_status_idx" ON "LandValuation"("status");

-- CreateIndex
CREATE INDEX "LandValuation_confidenceScore_idx" ON "LandValuation"("confidenceScore");

-- CreateIndex
CREATE INDEX "LandDeal_publicRecordId_idx" ON "LandDeal"("publicRecordId");

-- CreateIndex
CREATE INDEX "LandDeal_status_idx" ON "LandDeal"("status");

-- CreateIndex
CREATE INDEX "LandDeal_dealScore_idx" ON "LandDeal"("dealScore");

-- CreateIndex
CREATE INDEX "LandDeal_assignedToId_idx" ON "LandDeal"("assignedToId");

-- CreateIndex
CREATE INDEX "LandDeal_createdAt_idx" ON "LandDeal"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedLandOffer_dealId_idx" ON "GeneratedLandOffer"("dealId");

-- CreateIndex
CREATE INDEX "GeneratedLandOffer_publicRecordId_idx" ON "GeneratedLandOffer"("publicRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "CashBuyer_userId_key" ON "CashBuyer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CashBuyer_email_key" ON "CashBuyer"("email");

-- CreateIndex
CREATE INDEX "CashBuyer_verificationStatus_idx" ON "CashBuyer"("verificationStatus");

-- CreateIndex
CREATE INDEX "CashBuyer_targetStates_idx" ON "CashBuyer"("targetStates");

-- CreateIndex
CREATE INDEX "CashBuyer_maxPrice_idx" ON "CashBuyer"("maxPrice");

-- CreateIndex
CREATE INDEX "DealBuyerMatch_dealId_idx" ON "DealBuyerMatch"("dealId");

-- CreateIndex
CREATE INDEX "DealBuyerMatch_buyerId_idx" ON "DealBuyerMatch"("buyerId");

-- CreateIndex
CREATE INDEX "DealBuyerMatch_matchScore_idx" ON "DealBuyerMatch"("matchScore");

-- CreateIndex
CREATE UNIQUE INDEX "DealBuyerMatch_dealId_buyerId_key" ON "DealBuyerMatch"("dealId", "buyerId");

-- CreateIndex
CREATE INDEX "LandScanJob_status_idx" ON "LandScanJob"("status");

-- CreateIndex
CREATE INDEX "LandScanJob_createdById_idx" ON "LandScanJob"("createdById");

-- AddForeignKey
ALTER TABLE "LandValuation" ADD CONSTRAINT "LandValuation_publicRecordId_fkey" FOREIGN KEY ("publicRecordId") REFERENCES "PublicRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandDeal" ADD CONSTRAINT "LandDeal_publicRecordId_fkey" FOREIGN KEY ("publicRecordId") REFERENCES "PublicRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandDeal" ADD CONSTRAINT "LandDeal_valuationId_fkey" FOREIGN KEY ("valuationId") REFERENCES "LandValuation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandDeal" ADD CONSTRAINT "LandDeal_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLandOffer" ADD CONSTRAINT "GeneratedLandOffer_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "LandDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLandOffer" ADD CONSTRAINT "GeneratedLandOffer_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OfferTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedLandOffer" ADD CONSTRAINT "GeneratedLandOffer_publicRecordId_fkey" FOREIGN KEY ("publicRecordId") REFERENCES "PublicRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CashBuyer" ADD CONSTRAINT "CashBuyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealBuyerMatch" ADD CONSTRAINT "DealBuyerMatch_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "LandDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealBuyerMatch" ADD CONSTRAINT "DealBuyerMatch_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "CashBuyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LandScanJob" ADD CONSTRAINT "LandScanJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
