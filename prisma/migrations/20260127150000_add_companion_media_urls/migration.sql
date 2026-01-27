-- AlterTable
ALTER TABLE "Book" ADD COLUMN "companionMediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
