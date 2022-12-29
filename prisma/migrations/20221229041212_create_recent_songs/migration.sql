-- CreateTable
CREATE TABLE "RecentSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "likedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "albumUri" TEXT NOT NULL,
    "albumName" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artistUri" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'liked',
    CONSTRAINT "RecentSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RecentSongs_trackId_userId_key" ON "RecentSongs"("trackId", "userId");
