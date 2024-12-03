-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "bio" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    CONSTRAINT "Profile_id_fkey" FOREIGN KEY ("id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("bio", "createdAt", "email", "id", "image", "name", "updatedAt") SELECT "bio", "createdAt", "email", "id", "image", "name", "updatedAt" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
