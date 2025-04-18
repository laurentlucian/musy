/*
  Warnings:

  - You are about to drop the column `background` on the `Settings` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ColorPreset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "themeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'musy',
    "backgroundLight" TEXT NOT NULL DEFAULT '#EEE6E2',
    "backgroundDark" TEXT NOT NULL DEFAULT '#090808',
    "mainTextLight" TEXT NOT NULL DEFAULT '#161616',
    "mainTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "subTextLight" TEXT NOT NULL DEFAULT '#161616',
    "subTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "playerColorLight" TEXT NOT NULL DEFAULT '#E7DFD9',
    "playerColorDark" TEXT NOT NULL DEFAULT '#101010',
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ColorPreset_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "isPreset" BOOLEAN NOT NULL DEFAULT true,
    "backgroundLight" TEXT NOT NULL DEFAULT '#EEE6E2',
    "backgroundDark" TEXT NOT NULL DEFAULT '#090808',
    "mainTextLight" TEXT NOT NULL DEFAULT '#161616',
    "mainTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "subTextLight" TEXT NOT NULL DEFAULT '#161616',
    "subTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "gradient" BOOLEAN NOT NULL DEFAULT false,
    "playerColorLight" TEXT NOT NULL DEFAULT '#E7DFD9',
    "playerColorDark" TEXT NOT NULL DEFAULT '#101010',
    "blur" BOOLEAN NOT NULL DEFAULT true,
    "opaque" BOOLEAN NOT NULL DEFAULT false,
    "musyLogo" TEXT NOT NULL DEFAULT 'musy',
    CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "allowRecommend" TEXT NOT NULL DEFAULT 'on',
    "allowPreview" BOOLEAN NOT NULL DEFAULT false,
    "profileSongId" TEXT,
    "pauseQueue" BOOLEAN NOT NULL DEFAULT false,
    "pauseRecent" BOOLEAN NOT NULL DEFAULT false,
    "pauseRecentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Settings_profileSongId_fkey" FOREIGN KEY ("profileSongId") REFERENCES "Track" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Settings" ("allowPreview", "allowQueue", "allowRecommend", "autoscroll", "createdAt", "id", "isPrivate", "pauseQueue", "pauseRecent", "pauseRecentAt", "profileSongId", "updatedAt", "userId") SELECT "allowPreview", "allowQueue", "allowRecommend", "autoscroll", "createdAt", "id", "isPrivate", "pauseQueue", "pauseRecent", "pauseRecentAt", "profileSongId", "updatedAt", "userId" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Theme_userId_key" ON "Theme"("userId");
