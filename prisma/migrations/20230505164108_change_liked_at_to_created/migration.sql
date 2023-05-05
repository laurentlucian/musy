/*
  Warnings:

  - You are about to drop the column `likedAt` on the `LikedSongs` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LikedSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'liked',
    CONSTRAINT "LikedSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LikedSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LikedSongs" ("action", "id", "trackId", "userId", "createdAt") SELECT "action", "id", "trackId", "userId", "likedAt" FROM "LikedSongs";
DROP TABLE "LikedSongs";
ALTER TABLE "new_LikedSongs" RENAME TO "LikedSongs";
CREATE UNIQUE INDEX "LikedSongs_trackId_userId_key" ON "LikedSongs"("trackId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
