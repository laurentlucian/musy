/*
  Warnings:

  - You are about to drop the `_PlaylistToTrack` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `uri` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_PlaylistToTrack_B_index";

-- DropIndex
DROP INDEX "_PlaylistToTrack_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PlaylistToTrack";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "addedAt" DATETIME NOT NULL,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,

    PRIMARY KEY ("playlistId", "trackId"),
    CONSTRAINT "PlaylistTrack_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "uri" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("description", "id", "image", "name", "userId") SELECT "description", "id", "image", "name", "userId" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_id_key" ON "Playlist"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
