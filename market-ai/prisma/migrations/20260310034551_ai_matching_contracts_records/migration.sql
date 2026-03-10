-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PURCHASE_AGREEMENT', 'ASSIGNMENT_CONTRACT', 'OPTION_CONTRACT');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'SIGNED', 'VOIDED');

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "factors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadScore" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "signals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "state" TEXT,
    "content" TEXT NOT NULL,
    "clauses" JSONB NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedContract" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "propertyId" TEXT,
    "buyerId" TEXT,
    "sellerId" TEXT,
    "variables" JSONB NOT NULL,
    "finalContent" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicRecord" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerMailingAddress" TEXT NOT NULL,
    "propertyAddress" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "assessedValue" INTEGER NOT NULL,
    "marketValue" INTEGER NOT NULL,
    "taxStatus" TEXT NOT NULL,
    "zoning" TEXT NOT NULL,
    "lotSizeAcres" DOUBLE PRECISION NOT NULL,
    "improvements" JSONB NOT NULL,
    "deedHistory" JSONB NOT NULL,
    "liens" JSONB NOT NULL,
    "ownershipDuration" INTEGER NOT NULL,
    "isOutOfState" BOOLEAN NOT NULL DEFAULT false,
    "lastSaleDate" TIMESTAMP(3),
    "lastSalePrice" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_propertyId_buyerId_key" ON "MatchScore"("propertyId", "buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadScore_propertyId_key" ON "LeadScore"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicRecord_parcelId_key" ON "PublicRecord"("parcelId");

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadScore" ADD CONSTRAINT "LeadScore_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContract" ADD CONSTRAINT "GeneratedContract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
