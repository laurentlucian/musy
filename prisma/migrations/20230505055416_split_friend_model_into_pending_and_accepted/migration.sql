/*
  Warnings:

  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Friends";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PendingFriends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "pendingFriendId" INTEGER NOT NULL,
    CONSTRAINT "PendingFriends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingFriends_pendingFriendId_fkey" FOREIGN KEY ("pendingFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcceptedFriends" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "acceptedFriendId" INTEGER NOT NULL,
    CONSTRAINT "AcceptedFriends_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AcceptedFriends_acceptedFriendId_fkey" FOREIGN KEY ("acceptedFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingFriends_userId_pendingFriendId_key" ON "PendingFriends"("userId", "pendingFriendId");

-- CreateIndex
CREATE UNIQUE INDEX "AcceptedFriends_userId_acceptedFriendId_key" ON "AcceptedFriends"("userId", "acceptedFriendId");
