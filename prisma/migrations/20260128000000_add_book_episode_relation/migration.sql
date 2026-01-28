-- CreateTable
CREATE TABLE "BookEpisode" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,

    CONSTRAINT "BookEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookEpisode_bookId_episodeId_key" ON "BookEpisode"("bookId", "episodeId");

-- CreateIndex
CREATE INDEX "BookEpisode_bookId_idx" ON "BookEpisode"("bookId");

-- CreateIndex
CREATE INDEX "BookEpisode_episodeId_idx" ON "BookEpisode"("episodeId");

-- AddForeignKey
ALTER TABLE "BookEpisode" ADD CONSTRAINT "BookEpisode_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookEpisode" ADD CONSTRAINT "BookEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
