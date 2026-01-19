-- Add Goodreads score fields and external reviews to books
ALTER TABLE "Book" ADD COLUMN "goodreadsRating" DOUBLE PRECISION;
ALTER TABLE "Book" ADD COLUMN "goodreadsReviews" INTEGER;
ALTER TABLE "Book" ADD COLUMN "externalReviews" JSONB;
