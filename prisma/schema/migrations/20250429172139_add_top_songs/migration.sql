-- CreateTable
CREATE TABLE "TopSongs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "trackIds" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TopSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TopSongsToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TopSongsToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "TopSongs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TopSongsToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TopSongs_id_key" ON "TopSongs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_TopSongsToTrack_AB_unique" ON "_TopSongsToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_TopSongsToTrack_B_index" ON "_TopSongsToTrack"("B");
