/*
  Warnings:

  - You are about to drop the `FavUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FavUsers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "favoriteId" TEXT NOT NULL,
    "favoritedById" TEXT NOT NULL,
    CONSTRAINT "Favorite_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_favoritedById_fkey" FOREIGN KEY ("favoritedById") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
