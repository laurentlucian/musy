/*
  Warnings:

  - The primary key for the `Follow` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followId` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Follow` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Follow` table. All the data in the column will be lost.
  - Added the required column `followerId` to the `Follow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingId` to the `Follow` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Follow" (
    "followingId" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,

    PRIMARY KEY ("followingId", "followerId"),
    CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
DROP TABLE "Follow";
ALTER TABLE "new_Follow" RENAME TO "Follow";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
