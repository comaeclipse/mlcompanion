-- CreateIndex
CREATE INDEX "Video_tags_idx" ON "Video" USING GIN ("tags");
