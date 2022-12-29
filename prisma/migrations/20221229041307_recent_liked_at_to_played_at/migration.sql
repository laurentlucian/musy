/*
  Warnings:

  - You are about to drop the column `likedAt` on the `RecentSongs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecentSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO "new_RecentSongs" ("action", "albumName", "albumUri", "artist", "artistUri", "explicit", "id", "image", "name", "trackId", "uri", "userId") SELECT "action", "albumName", "albumUri", "artist", "artistUri", "explicit", "id", "image", "name", "trackId", "uri", "userId" FROM "RecentSongs";
DROP TABLE "RecentSongs";
ALTER TABLE "new_RecentSongs" RENAME TO "RecentSongs";
CREATE UNIQUE INDEX "RecentSongs_trackId_userId_key" ON "RecentSongs"("trackId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
