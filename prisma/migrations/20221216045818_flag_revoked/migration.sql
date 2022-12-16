-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" INTEGER NOT NULL,
    "tokenType" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("accessToken", "createdAt", "expiresAt", "id", "refreshToken", "tokenType", "updatedAt") SELECT "accessToken", "createdAt", "expiresAt", "id", "refreshToken", "tokenType", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
