-- Enable foreign keys
PRAGMA foreign_keys=off;

-- Rename tables
ALTER TABLE "AI" RENAME TO "Generated";
ALTER TABLE "AIPlaylist" RENAME TO "GeneratedPlaylist";
ALTER TABLE "_AIPlaylistToTrack" RENAME TO "_GeneratedPlaylistToTrack";

-- Update indexes for the join table
DROP INDEX IF EXISTS "_AIPlaylistToTrack_AB_unique";
DROP INDEX IF EXISTS "_AIPlaylistToTrack_B_index";
CREATE UNIQUE INDEX "_GeneratedPlaylistToTrack_AB_unique" ON "_GeneratedPlaylistToTrack"("A", "B");
CREATE INDEX "_GeneratedPlaylistToTrack_B_index" ON "_GeneratedPlaylistToTrack"("B");

-- Add unique constraints
CREATE UNIQUE INDEX "GeneratedPlaylist_id_key" ON "GeneratedPlaylist"("id");
CREATE UNIQUE INDEX "Generated_userId_key" ON "Generated"("userId");

PRAGMA foreign_keys=on;