/*
  Warnings:

  - You are about to drop the column `allowRecommend` on the `Settings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "autoscroll" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "allowQueue" TEXT NOT NULL DEFAULT 'on',
    "allowPreview" BOOLEAN NOT NULL DEFAULT false,
    "profileSongId" TEXT,
    "pauseQueue" BOOLEAN NOT NULL DEFAULT false,
    "pauseRecent" BOOLEAN NOT NULL DEFAULT false,
    "pauseRecentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerButtonRight" BOOLEAN NOT NULL DEFAULT false,
    "founder" BOOLEAN NOT NULL DEFAULT false,
    "dev" BOOLEAN NOT NULL DEFAULT false,
    "easterEgg" BOOLEAN NOT NULL DEFAULT false,
    "miniPlayer" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Settings_profileSongId_fkey" FOREIGN KEY ("profileSongId") REFERENCES "Track" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Settings" ("allowPreview", "allowQueue", "autoscroll", "createdAt", "dev", "easterEgg", "founder", "id", "isPrivate", "miniPlayer", "pauseQueue", "pauseRecent", "pauseRecentAt", "playerButtonRight", "profileSongId", "updatedAt", "userId") SELECT "allowPreview", "allowQueue", "autoscroll", "createdAt", "dev", "easterEgg", "founder", "id", "isPrivate", "miniPlayer", "pauseQueue", "pauseRecent", "pauseRecentAt", "playerButtonRight", "profileSongId", "updatedAt", "userId" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
