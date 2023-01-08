PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecommendedSongs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "trackId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "albumUri" TEXT,
    "albumName" TEXT,
    "artist" TEXT NOT NULL,
    "artistUri" TEXT,
    "explicit" BOOLEAN NOT NULL,
    "senderId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'recommend',
    CONSTRAINT "RecommendedSongs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RecommendedSongs_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RecommendedSongs" ("action", "albumName", "albumUri", "artist", "artistUri", "createdAt", "explicit", "id", "image", "name", "ownerId", "pending", "trackId", "uri", "senderId") SELECT "action", "albumName", "albumUri", "artist", "artistUri", "createdAt", "explicit", "id", "image", "name", "ownerId", "pending", "trackId", "uri", "userId" FROM "RecommendedSongs";
DROP TABLE "RecommendedSongs";
ALTER TABLE "new_RecommendedSongs" RENAME TO "RecommendedSongs";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
