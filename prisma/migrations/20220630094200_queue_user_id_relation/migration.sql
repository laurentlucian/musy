/*
  Warnings:

  - The primary key for the `Queue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `userImage` on the `Queue` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "ownerId" TEXT NOT NULL PRIMARY KEY,
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
