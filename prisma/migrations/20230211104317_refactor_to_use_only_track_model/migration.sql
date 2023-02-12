/*
  Warnings:

  - You are about to drop the column `albumName` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `albumUri` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `artist` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `artistUri` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `preview_url` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `RecommendedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `albumName` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `albumUri` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `artist` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `artistUri` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `preview_url` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `albumName` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `albumUri` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `artist` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `artistUri` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `preview_url` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `LikedSongs` table. All the data in the column will be lost.
  - You are about to drop the column `albumName` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `albumUri` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `artist` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `artistUri` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `explicit` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `preview_url` on the `RecentSongs` table. All the data in the column will be lost.
  - You are about to drop the column `uri` on the `RecentSongs` table. All the data in the column will be lost.
  - Made the column `trackId` on table `Queue` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecommendedSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "rating" INTEGER,
    "trackId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'recommend',
    CONSTRAINT "RecommendedSongs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecommendedSongs_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecommendedSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecommendedSongs" ("action", "comment", "createdAt", "id", "ownerId", "pending", "rating", "senderId", "trackId") SELECT "action", "comment", "createdAt", "id", "ownerId", "pending", "rating", "senderId", "trackId" FROM "RecommendedSongs";
DROP TABLE "RecommendedSongs";
ALTER TABLE "new_RecommendedSongs" RENAME TO "RecommendedSongs";
CREATE TABLE "new_Queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "trackId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL DEFAULT 'add',
    CONSTRAINT "Queue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Queue_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("action", "createdAt", "id", "ownerId", "pending", "trackId", "userId") SELECT "action", "createdAt", "id", "ownerId", "pending", "trackId", "userId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
CREATE TABLE "new_LikedSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "likedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL DEFAULT 'liked',
    CONSTRAINT "LikedSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LikedSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LikedSongs" ("action", "id", "likedAt", "trackId", "userId") SELECT "action", "id", "likedAt", "trackId", "userId" FROM "LikedSongs";
DROP TABLE "LikedSongs";
ALTER TABLE "new_LikedSongs" RENAME TO "LikedSongs";
CREATE UNIQUE INDEX "LikedSongs_trackId_userId_key" ON "LikedSongs"("trackId", "userId");
CREATE TABLE "new_RecentSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'recent',
    CONSTRAINT "RecentSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecentSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecentSongs" ("action", "id", "playedAt", "trackId", "userId") SELECT "action", "id", "playedAt", "trackId", "userId" FROM "RecentSongs";
DROP TABLE "RecentSongs";
ALTER TABLE "new_RecentSongs" RENAME TO "RecentSongs";
CREATE UNIQUE INDEX "RecentSongs_playedAt_userId_key" ON "RecentSongs"("playedAt", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
