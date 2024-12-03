/*
  Warnings:

  - You are about to drop the column `verifiedFromSpotify` on the `RecentSongs` table. All the data in the column will be lost.

*/
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
    CONSTRAINT "RecentSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecentSongs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RecentSongs" ("action", "id", "playedAt", "sessionId", "trackId", "userId") SELECT "action", "id", "playedAt", "sessionId", "trackId", "userId" FROM "RecentSongs";
DROP TABLE "RecentSongs";
ALTER TABLE "new_RecentSongs" RENAME TO "RecentSongs";
CREATE UNIQUE INDEX "RecentSongs_playedAt_userId_key" ON "RecentSongs"("playedAt", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
