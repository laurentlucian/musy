/*
  Warnings:

  - You are about to alter the column `expiresAt` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "tokenType" TEXT NOT NULL
);
INSERT INTO "new_User" ("accessToken", "createdAt", "expiresAt", "id", "refreshToken", "tokenType", "updatedAt") SELECT "accessToken", "createdAt", "expiresAt", "id", "refreshToken", "tokenType", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
