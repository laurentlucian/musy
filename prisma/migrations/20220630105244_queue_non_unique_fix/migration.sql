/*
  Warnings:

  - The primary key for the `Queue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Queue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("artist", "createdAt", "explicit", "image", "name", "ownerId", "uri", "userId") SELECT "artist", "createdAt", "explicit", "image", "name", "ownerId", "uri", "userId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
