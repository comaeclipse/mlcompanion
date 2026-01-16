-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isbn" TEXT,
    "isbn13" TEXT,
    "authors" TEXT[],
    "publisher" TEXT,
    "publishedDate" TEXT,
    "thumbnailUrl" TEXT,
    "pageCount" INTEGER,
    "categories" TEXT[],
    "language" TEXT,
    "previewLink" TEXT,
    "infoLink" TEXT,
    "tags" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Book_createdBy_idx" ON "Book"("createdBy");

-- CreateIndex
CREATE INDEX "Book_isPublished_idx" ON "Book"("isPublished");

-- CreateIndex
CREATE INDEX "Book_isbn_idx" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_isbn13_idx" ON "Book"("isbn13");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
