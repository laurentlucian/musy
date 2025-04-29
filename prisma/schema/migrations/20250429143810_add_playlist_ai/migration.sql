-- CreateTable
CREATE TABLE "AIPlaylist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mood" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "AIPlaylist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "AI" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AIPlaylistToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AIPlaylistToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "AIPlaylist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AIPlaylistToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AIPlaylist_id_key" ON "AIPlaylist"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_AIPlaylistToTrack_AB_unique" ON "_AIPlaylistToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_AIPlaylistToTrack_B_index" ON "_AIPlaylistToTrack"("B");
