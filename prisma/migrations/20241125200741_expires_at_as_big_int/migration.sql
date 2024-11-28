/*
  Warnings:

  - You are about to alter the column `expiresAt` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("accessToken", "createdAt", "expiresAt", "id", "refreshToken", "revoked", "tokenType", "updatedAt") SELECT "accessToken", "createdAt", "expiresAt", "id", "refreshToken", "revoked", "tokenType", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
