/*
  Warnings:

  - You are about to alter the column `updatedAt` on the `Playback` table. The data in that column could be lost. The data in that column will be cast from `Int` to `DateTime`.

*/
-- CreateTable
CREATE TABLE "PlaybackHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PlaybackHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL,
    CONSTRAINT "Playback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Playback_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playback" ("createdAt", "id", "progress", "trackId", "updatedAt", "userId") SELECT "createdAt", "id", "progress", "trackId", "updatedAt", "userId" FROM "Playback";
DROP TABLE "Playback";
ALTER TABLE "new_Playback" RENAME TO "Playback";
CREATE UNIQUE INDEX "Playback_userId_key" ON "Playback"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
