-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LikedSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "likedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trackId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "albumUri" TEXT,
    "albumName" TEXT,
    "artist" TEXT NOT NULL,
    "artistUri" TEXT,
    "explicit" BOOLEAN NOT NULL,
    "preview_url" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "action" TEXT NOT NULL DEFAULT 'liked',
    CONSTRAINT "LikedSongs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LikedSongs_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LikedSongs" ("action", "albumName", "albumUri", "artist", "artistUri", "duration", "explicit", "id", "image", "likedAt", "name", "trackId", "uri", "userId") SELECT "action", "albumName", "albumUri", "artist", "artistUri", "duration", "explicit", "id", "image", "likedAt", "name", "trackId", "uri", "userId" FROM "LikedSongs";
DROP TABLE "LikedSongs";
ALTER TABLE "new_LikedSongs" RENAME TO "LikedSongs";
CREATE UNIQUE INDEX "LikedSongs_trackId_userId_key" ON "LikedSongs"("trackId", "userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
