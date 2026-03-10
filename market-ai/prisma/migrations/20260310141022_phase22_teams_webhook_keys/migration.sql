-- CreateEnum
CREATE TYPE "PolicyTeamRole" AS ENUM ('REQUESTER', 'APPROVER');

-- CreateTable
CREATE TABLE "PolicyTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" "PolicyTeamRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSigningKey" (
    "kid" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookSigningKey_pkey" PRIMARY KEY ("kid")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyTeam_slug_key" ON "PolicyTeam"("slug");

-- CreateIndex
CREATE INDEX "PolicyTeamMember_teamId_idx" ON "PolicyTeamMember"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyTeamMember_teamId_email_key" ON "PolicyTeamMember"("teamId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyTeamMember_teamId_domain_key" ON "PolicyTeamMember"("teamId", "domain");

-- AddForeignKey
ALTER TABLE "PolicyTeamMember" ADD CONSTRAINT "PolicyTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "PolicyTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
