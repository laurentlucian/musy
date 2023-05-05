/*
  Warnings:

  - You are about to drop the column `blockId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `blockedById` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `muteId` on the `Mute` table. All the data in the column will be lost.
  - You are about to drop the column `mutedById` on the `Mute` table. All the data in the column will be lost.
  - You are about to drop the column `favoritedById` on the `Favorite` table. All the data in the column will be lost.
  - Added the required column `blockedId` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mutedId` to the `Mute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Mute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Favorite` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    CONSTRAINT "Block_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Block" ("favAt", "id") SELECT "favAt", "id" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_userId_blockedId_key" ON "Block"("userId", "blockedId");
CREATE TABLE "new_Mute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "mutedId" TEXT NOT NULL,
    CONSTRAINT "Mute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mute_mutedId_fkey" FOREIGN KEY ("mutedId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mute" ("favAt", "id") SELECT "favAt", "id" FROM "Mute";
DROP TABLE "Mute";
ALTER TABLE "new_Mute" RENAME TO "Mute";
CREATE UNIQUE INDEX "Mute_userId_mutedId_key" ON "Mute"("userId", "mutedId");
CREATE TABLE "new_Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "favoriteId" TEXT NOT NULL,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("favAt", "favoriteId", "id") SELECT "favAt", "favoriteId", "id" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE UNIQUE INDEX "Favorite_userId_favoriteId_key" ON "Favorite"("userId", "favoriteId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
