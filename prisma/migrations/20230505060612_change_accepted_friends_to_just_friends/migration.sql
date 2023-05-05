/*
  Warnings:

  - You are about to drop the `AcceptedFriends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PendingFriends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AcceptedFriends";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PendingFriends";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PendingFriend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "pendingFriendId" INTEGER NOT NULL,
    CONSTRAINT "PendingFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingFriend_pendingFriendId_fkey" FOREIGN KEY ("pendingFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "acceptedFriendId" INTEGER NOT NULL,
    CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_acceptedFriendId_fkey" FOREIGN KEY ("acceptedFriendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingFriend_userId_pendingFriendId_key" ON "PendingFriend"("userId", "pendingFriendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_acceptedFriendId_key" ON "Friend"("userId", "acceptedFriendId");
