/*
  Warnings:

  - You are about to drop the column `name` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `queuerId` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `track` on the `Queue` table. All the data in the column will be lost.
  - Added the required column `trackName` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackName" TEXT NOT NULL,
    "profileId" INTEGER,
    "userId" TEXT,
    CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Queue_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("createdAt", "id", "profileId") SELECT "createdAt", "id", "profileId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
