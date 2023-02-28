/*
  Warnings:

  - You are about to drop the column `createdAt` on the `FavUsers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `FavUsers` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavUsers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FavUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FavUsers" ("favAt", "id", "userId") SELECT "favAt", "id", "userId" FROM "FavUsers";
DROP TABLE "FavUsers";
ALTER TABLE "new_FavUsers" RENAME TO "FavUsers";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
