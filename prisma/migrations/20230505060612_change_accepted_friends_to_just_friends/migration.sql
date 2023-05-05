/*
  Warnings:

  - You are about to drop the `AcceptedFriends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingFriends` table. If the table is not empty, all the data it contains will be lost.

*/

PRAGMA foreign_keys=off;

-- CreateTable
CREATE TABLE "PendingFriend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "pendingFriendId" TEXT NOT NULL,
    CONSTRAINT "PendingFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingFriend_pendingFriendId_fkey" FOREIGN KEY ("pendingFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "PendingFriend" ("id", "userId", "pendingFriendId") SELECT "id", "userId", "pendingFriendId" FROM "PendingFriends";
DROP TABLE "PendingFriends";

-- CreateTable
CREATE TABLE "Friend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "acceptedFriendId" TEXT NOT NULL,
    CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_acceptedFriendId_fkey" FOREIGN KEY ("acceptedFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "Friend" ("id", "userId", "acceptedFriendId") SELECT "id", "userId", "acceptedFriendId" FROM "AcceptedFriends";
DROP TABLE "AcceptedFriends";

-- CreateIndex
CREATE UNIQUE INDEX "PendingFriend_userId_pendingFriendId_key" ON "PendingFriend"("userId", "pendingFriendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_acceptedFriendId_key" ON "Friend"("userId", "acceptedFriendId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=on;