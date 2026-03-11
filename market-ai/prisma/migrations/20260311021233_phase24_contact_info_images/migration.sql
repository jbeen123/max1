-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "images" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "phone" TEXT;
