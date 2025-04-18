/*
  Warnings:

  - You are about to drop the column `isFavorite` on the `ColorPreset` table. All the data in the column will be lost.
  - You are about to drop the column `themeId` on the `ColorPreset` table. All the data in the column will be lost.
  - The primary key for the `Theme` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Theme` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `ColorPreset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_ColorPresetToTheme" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ColorPresetToTheme_A_fkey" FOREIGN KEY ("A") REFERENCES "ColorPreset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ColorPresetToTheme_B_fkey" FOREIGN KEY ("B") REFERENCES "Theme" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ColorPreset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'musy',
    "backgroundLight" TEXT NOT NULL DEFAULT '#EEE6E2',
    "backgroundDark" TEXT NOT NULL DEFAULT '#090808',
    "mainTextLight" TEXT NOT NULL DEFAULT '#161616',
    "mainTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "subTextLight" TEXT NOT NULL DEFAULT '#161616',
    "subTextDark" TEXT NOT NULL DEFAULT '#EEE6E2',
    "playerColorLight" TEXT NOT NULL DEFAULT '#E7DFD9',
    "playerColorDark" TEXT NOT NULL DEFAULT '#101010',
    CONSTRAINT "ColorPreset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ColorPreset" ("backgroundDark", "backgroundLight", "id", "mainTextDark", "mainTextLight", "name", "playerColorDark", "playerColorLight", "subTextDark", "subTextLight") SELECT "backgroundDark", "backgroundLight", "id", "mainTextDark", "mainTextLight", "name", "playerColorDark", "playerColorLight", "subTextDark", "subTextLight" FROM "ColorPreset";
DROP TABLE "ColorPreset";
ALTER TABLE "new_ColorPreset" RENAME TO "ColorPreset";
CREATE TABLE "new_Theme" (
    "userId" TEXT NOT NULL PRIMARY KEY,
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
INSERT INTO "new_Theme" ("backgroundDark", "backgroundLight", "blur", "gradient", "isPreset", "mainTextDark", "mainTextLight", "musyLogo", "opaque", "playerColorDark", "playerColorLight", "subTextDark", "subTextLight", "userId") SELECT "backgroundDark", "backgroundLight", "blur", "gradient", "isPreset", "mainTextDark", "mainTextLight", "musyLogo", "opaque", "playerColorDark", "playerColorLight", "subTextDark", "subTextLight", "userId" FROM "Theme";
DROP TABLE "Theme";
ALTER TABLE "new_Theme" RENAME TO "Theme";
CREATE UNIQUE INDEX "Theme_userId_key" ON "Theme"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_ColorPresetToTheme_AB_unique" ON "_ColorPresetToTheme"("A", "B");

-- CreateIndex
CREATE INDEX "_ColorPresetToTheme_B_index" ON "_ColorPresetToTheme"("B");
