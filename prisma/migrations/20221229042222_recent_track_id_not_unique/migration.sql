/*
  Warnings:

  - A unique constraint covering the columns `[playedAt,userId]` on the table `RecentSongs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RecentSongs_trackId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "RecentSongs_playedAt_userId_key" ON "RecentSongs"("playedAt", "userId");
