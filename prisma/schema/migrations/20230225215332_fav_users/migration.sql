-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavUsers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "FavUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FavUsers" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "FavUsers";
DROP TABLE "FavUsers";
ALTER TABLE "new_FavUsers" RENAME TO "FavUsers";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
