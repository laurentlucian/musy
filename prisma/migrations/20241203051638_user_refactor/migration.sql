/*
  Warnings:

  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `accessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokenType` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Provider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AI" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "mood" TEXT,
    CONSTRAINT "AI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AI" ("createdAt", "id", "mood", "updatedAt", "userId") SELECT "createdAt", "id", "mood", "updatedAt", "userId" FROM "AI";
DROP TABLE "AI";
ALTER TABLE "new_AI" RENAME TO "AI";
CREATE UNIQUE INDEX "AI_userId_key" ON "AI"("userId");
CREATE TABLE "new_Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    CONSTRAINT "Block_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Block" ("blockedId", "favAt", "id", "userId") SELECT "blockedId", "favAt", "id", "userId" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_userId_blockedId_key" ON "Block"("userId", "blockedId");
CREATE TABLE "new_Favorite" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "favoriteId" TEXT NOT NULL,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_favoriteId_fkey" FOREIGN KEY ("favoriteId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Favorite" ("favAt", "favoriteId", "id", "userId") SELECT "favAt", "favoriteId", "id", "userId" FROM "Favorite";
DROP TABLE "Favorite";
ALTER TABLE "new_Favorite" RENAME TO "Favorite";
CREATE UNIQUE INDEX "Favorite_userId_favoriteId_key" ON "Favorite"("userId", "favoriteId");
CREATE TABLE "new_Feed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Feed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Feed" ("createdAt", "id", "userId") SELECT "createdAt", "id", "userId" FROM "Feed";
DROP TABLE "Feed";
ALTER TABLE "new_Feed" RENAME TO "Feed";
CREATE INDEX "Feed_createdAt_idx" ON "Feed"("createdAt");
CREATE TABLE "new_Follow" (
    "followingId" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,

    PRIMARY KEY ("followingId", "followerId"),
    CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follow" ("followerId", "followingId") SELECT "followerId", "followingId" FROM "Follow";
DROP TABLE "Follow";
ALTER TABLE "new_Follow" RENAME TO "Follow";
CREATE TABLE "new_LikedSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'liked',
    "feedId" INTEGER,
    CONSTRAINT "LikedSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LikedSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LikedSongs_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LikedSongs" ("action", "createdAt", "feedId", "id", "trackId", "userId") SELECT "action", "createdAt", "feedId", "id", "trackId", "userId" FROM "LikedSongs";
DROP TABLE "LikedSongs";
ALTER TABLE "new_LikedSongs" RENAME TO "LikedSongs";
CREATE UNIQUE INDEX "LikedSongs_feedId_key" ON "LikedSongs"("feedId");
CREATE UNIQUE INDEX "LikedSongs_trackId_userId_key" ON "LikedSongs"("trackId", "userId");
CREATE TABLE "new_Mute" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "favAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "mutedId" TEXT NOT NULL,
    CONSTRAINT "Mute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Mute_mutedId_fkey" FOREIGN KEY ("mutedId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mute" ("favAt", "id", "mutedId", "userId") SELECT "favAt", "id", "mutedId", "userId" FROM "Mute";
DROP TABLE "Mute";
ALTER TABLE "new_Mute" RENAME TO "Mute";
CREATE UNIQUE INDEX "Mute_userId_mutedId_key" ON "Mute"("userId", "mutedId");
CREATE TABLE "new_Party" (
    "ownerId" TEXT NOT NULL,
    "currentTrack" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userImage" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("ownerId", "userId"),
    CONSTRAINT "Party_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Party_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Party" ("assignedAt", "currentTrack", "ownerId", "userId", "userImage", "userName") SELECT "assignedAt", "currentTrack", "ownerId", "userId", "userImage", "userName" FROM "Party";
DROP TABLE "Party";
ALTER TABLE "new_Party" RENAME TO "Party";
CREATE UNIQUE INDEX "Party_userId_key" ON "Party"("userId");
CREATE TABLE "new_Playback" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL DEFAULT 0,
    "progress" INTEGER NOT NULL,
    CONSTRAINT "Playback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Playback_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playback" ("createdAt", "id", "progress", "timestamp", "trackId", "updatedAt", "userId") SELECT "createdAt", "id", "progress", "timestamp", "trackId", "updatedAt", "userId" FROM "Playback";
DROP TABLE "Playback";
ALTER TABLE "new_Playback" RENAME TO "Playback";
CREATE UNIQUE INDEX "Playback_userId_key" ON "Playback"("userId");
CREATE TABLE "new_PlaybackHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "feedId" INTEGER,
    CONSTRAINT "PlaybackHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaybackHistory_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlaybackHistory" ("endedAt", "feedId", "id", "startedAt", "userId") SELECT "endedAt", "feedId", "id", "startedAt", "userId" FROM "PlaybackHistory";
DROP TABLE "PlaybackHistory";
ALTER TABLE "new_PlaybackHistory" RENAME TO "PlaybackHistory";
CREATE UNIQUE INDEX "PlaybackHistory_feedId_key" ON "PlaybackHistory"("feedId");
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "uri" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("description", "id", "image", "name", "total", "uri", "userId") SELECT "description", "id", "image", "name", "total", "uri", "userId" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_id_key" ON "Playlist"("id");

CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    CONSTRAINT "Profile_id_fkey" FOREIGN KEY ("id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy data from old Profile to new Profile, using userId as the new id
INSERT INTO "new_Profile" (
    "id",  -- This will be populated with userId
    "createdAt",
    "updatedAt",
    "name",
    "bio",
    "email",
    "image"
) 
SELECT 
    "userId",  -- Use userId as the new id
    "createdAt",
    "updatedAt",
    "name",
    "bio",
    "email",
    "image"
FROM "Profile";

-- Drop old Profile table and rename new one
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";


CREATE TABLE "new_Queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "trackId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL DEFAULT 'add',
    "feedId" INTEGER,
    CONSTRAINT "Queue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Queue_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("action", "createdAt", "feedId", "id", "ownerId", "pending", "trackId", "userId") SELECT "action", "createdAt", "feedId", "id", "ownerId", "pending", "trackId", "userId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
CREATE UNIQUE INDEX "Queue_feedId_key" ON "Queue"("feedId");
CREATE TABLE "new_RecentSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'recent',
    "sessionId" INTEGER,
    CONSTRAINT "RecentSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecentSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecentSongs_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RecentSongs" ("action", "id", "playedAt", "sessionId", "trackId", "userId") SELECT "action", "id", "playedAt", "sessionId", "trackId", "userId" FROM "RecentSongs";
DROP TABLE "RecentSongs";
ALTER TABLE "new_RecentSongs" RENAME TO "RecentSongs";
CREATE UNIQUE INDEX "RecentSongs_playedAt_userId_key" ON "RecentSongs"("playedAt", "userId");
CREATE TABLE "new_Recommended" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" TEXT,
    "action" TEXT NOT NULL DEFAULT 'recommend',
    "feedId" INTEGER,
    CONSTRAINT "Recommended_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommended_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommended_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Recommended" ("action", "caption", "createdAt", "feedId", "id", "trackId", "updatedAt", "userId") SELECT "action", "caption", "createdAt", "feedId", "id", "trackId", "updatedAt", "userId" FROM "Recommended";
DROP TABLE "Recommended";
ALTER TABLE "new_Recommended" RENAME TO "Recommended";
CREATE UNIQUE INDEX "Recommended_feedId_key" ON "Recommended"("feedId");
CREATE TABLE "new_Sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sessions" ("createdAt", "id", "startTime", "updatedAt", "userId") SELECT "createdAt", "id", "startTime", "updatedAt", "userId" FROM "Sessions";
DROP TABLE "Sessions";
ALTER TABLE "new_Sessions" RENAME TO "Sessions";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "User";

INSERT INTO "Provider" (
    "type",
    "accessToken",
    "refreshToken",
    "expiresAt",
    "tokenType",
    "revoked",
    "userId"
) 
SELECT 
    'spotify' as type,
    accessToken,
    refreshToken,
    expiresAt,
    tokenType,
    revoked,
    id as userId
FROM "User"
WHERE accessToken IS NOT NULL;

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_userId_type_key" ON "Provider"("userId", "type");
