-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlaylistTrack" (
    "addedAt" DATETIME NOT NULL,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "feedId" INTEGER,
    CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTrack_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlaylistTrack" ("addedAt", "playlistId", "trackId") SELECT "addedAt", "playlistId", "trackId" FROM "PlaylistTrack";
DROP TABLE "PlaylistTrack";
ALTER TABLE "new_PlaylistTrack" RENAME TO "PlaylistTrack";
CREATE UNIQUE INDEX "PlaylistTrack_feedId_key" ON "PlaylistTrack"("feedId");
CREATE UNIQUE INDEX "PlaylistTrack_playlistId_trackId_key" ON "PlaylistTrack"("playlistId", "trackId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
