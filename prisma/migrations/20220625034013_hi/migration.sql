/*
  Warnings:

  - You are about to drop the column `profileId` on the `Recommended` table. All the data in the column will be lost.
  - You are about to drop the column `track` on the `Recommended` table. All the data in the column will be lost.
  - You are about to alter the column `recommenderId` on the `Recommended` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `userId` on the `Queue` table. All the data in the column will be lost.
  - Added the required column `artist` to the `Recommended` table without a default value. This is not possible if the table is not empty.
  - Added the required column `explicit` to the `Recommended` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Recommended` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Recommended` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackName` to the `Recommended` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artist` to the `Queue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `explicit` to the `Queue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Queue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Queue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recommended" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "comment" TEXT NOT NULL,
    "recommenderId" INTEGER,
    CONSTRAINT "Recommended_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommended_recommenderId_fkey" FOREIGN KEY ("recommenderId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Recommended" ("comment", "createdAt", "id", "name", "recommenderId", "updatedAt") SELECT "comment", "createdAt", "id", "name", "recommenderId", "updatedAt" FROM "Recommended";
DROP TABLE "Recommended";
ALTER TABLE "new_Recommended" RENAME TO "Recommended";
CREATE TABLE "new_Queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "explicit" BOOLEAN NOT NULL,
    "profileId" INTEGER,
    "queuerId" TEXT,
    CONSTRAINT "Queue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("createdAt", "id", "profileId", "trackName") SELECT "createdAt", "id", "profileId", "trackName" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
