/*
  Warnings:

  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Party` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Queue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "Block_userId_blockedId_key";

-- DropIndex
DROP INDEX "Favorite_userId_favoriteId_key";

-- DropIndex
DROP INDEX "Mute_userId_mutedId_key";

-- DropIndex
DROP INDEX "Party_userId_key";

-- DropIndex
DROP INDEX "Queue_feedId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Block";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Favorite";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Mute";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Party";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Queue";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Sessions";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecentSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'recent',
    "sessionId" INTEGER,
    CONSTRAINT "RecentSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecentSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecentSongs" ("action", "id", "playedAt", "sessionId", "trackId", "userId") SELECT "action", "id", "playedAt", "sessionId", "trackId", "userId" FROM "RecentSongs";
DROP TABLE "RecentSongs";
ALTER TABLE "new_RecentSongs" RENAME TO "RecentSongs";
CREATE UNIQUE INDEX "RecentSongs_playedAt_userId_key" ON "RecentSongs"("playedAt", "userId");
CREATE TABLE "new_Track" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "albumUri" TEXT NOT NULL,
    "albumName" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artistUri" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "preview_url" TEXT,
    "link" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'spotify'
);
INSERT INTO "new_Track" ("albumName", "albumUri", "artist", "artistUri", "duration", "explicit", "id", "image", "link", "name", "preview_url", "uri") SELECT "albumName", "albumUri", "artist", "artistUri", "duration", "explicit", "id", "image", "link", "name", "preview_url", "uri" FROM "Track";
DROP TABLE "Track";
ALTER TABLE "new_Track" RENAME TO "Track";
CREATE UNIQUE INDEX "Track_id_key" ON "Track"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
