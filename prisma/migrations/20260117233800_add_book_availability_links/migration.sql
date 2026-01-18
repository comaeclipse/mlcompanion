-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "purchaseLinks" JSONB,
ADD COLUMN     "readFreeLinks" TEXT[] DEFAULT ARRAY[]::TEXT[];
