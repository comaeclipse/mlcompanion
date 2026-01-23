-- CreateTable
CREATE TABLE "VideoBook" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "videoId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "VideoBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoBook_videoId_bookId_key" ON "VideoBook"("videoId", "bookId");

-- CreateIndex
CREATE INDEX "VideoBook_videoId_idx" ON "VideoBook"("videoId");

-- CreateIndex
CREATE INDEX "VideoBook_bookId_idx" ON "VideoBook"("bookId");

-- AddForeignKey
ALTER TABLE "VideoBook" ADD CONSTRAINT "VideoBook_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoBook" ADD CONSTRAINT "VideoBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
