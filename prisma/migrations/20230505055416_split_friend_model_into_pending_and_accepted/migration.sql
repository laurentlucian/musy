/*
  Warnings:

  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.

*/

-- moved drop friends after inserting data

PRAGMA foreign_keys=off;

-- Redefining Friends table into two tables
-- CreateTable
CREATE TABLE "PendingFriends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "pendingFriendId" TEXT NOT NULL,
    CONSTRAINT "PendingFriends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingFriends_pendingFriendId_fkey" FOREIGN KEY ("pendingFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "PendingFriends" ("id", "userId", "pendingFriendId") SELECT "id", "userId", "friendId" FROM "Friends" WHERE "status" = "pending";

-- CreateTable
CREATE TABLE "AcceptedFriends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "acceptedFriendId" TEXT NOT NULL,
    CONSTRAINT "AcceptedFriends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AcceptedFriends_acceptedFriendId_fkey" FOREIGN KEY ("acceptedFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "AcceptedFriends" ("id", "userId", "acceptedFriendId") SELECT "id", "userId", "friendId" FROM "Friends" WHERE "status" = "accepted";
DROP TABLE "Friends";

-- CreateIndex
CREATE UNIQUE INDEX "PendingFriends_userId_pendingFriendId_key" ON "PendingFriends"("userId", "pendingFriendId");

-- CreateIndex
CREATE UNIQUE INDEX "AcceptedFriends_userId_acceptedFriendId_key" ON "AcceptedFriends"("userId", "acceptedFriendId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=on;