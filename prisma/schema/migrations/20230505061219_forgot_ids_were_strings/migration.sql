-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Friend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "acceptedFriendId" TEXT NOT NULL,
    CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Friend_acceptedFriendId_fkey" FOREIGN KEY ("acceptedFriendId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Friend" ("acceptedFriendId", "id", "userId") SELECT "acceptedFriendId", "id", "userId" FROM "Friend";
DROP TABLE "Friend";
ALTER TABLE "new_Friend" RENAME TO "Friend";
CREATE UNIQUE INDEX "Friend_userId_acceptedFriendId_key" ON "Friend"("userId", "acceptedFriendId");
CREATE TABLE "new_PendingFriend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "pendingFriendId" TEXT NOT NULL,
    CONSTRAINT "PendingFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingFriend_pendingFriendId_fkey" FOREIGN KEY ("pendingFriendId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PendingFriend" ("id", "pendingFriendId", "userId") SELECT "id", "pendingFriendId", "userId" FROM "PendingFriend";
DROP TABLE "PendingFriend";
ALTER TABLE "new_PendingFriend" RENAME TO "PendingFriend";
CREATE UNIQUE INDEX "PendingFriend_userId_pendingFriendId_key" ON "PendingFriend"("userId", "pendingFriendId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
