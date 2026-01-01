-- Rename tables from Songs to Tracks for consistency
-- RecentSongs -> RecentTracks
ALTER TABLE `RecentSongs` RENAME TO `RecentTracks`;
--> statement-breakpoint
DROP INDEX IF EXISTS `RecentSongs_playedAt_userId_key`;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `RecentTracks_playedAt_userId_key` ON `RecentTracks` (`playedAt`,`userId`);
--> statement-breakpoint
-- LikedSongs -> LikedTracks
ALTER TABLE `LikedSongs` RENAME TO `LikedTracks`;
--> statement-breakpoint
DROP INDEX IF EXISTS `LikedSongs_trackId_userId_key`;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `LikedTracks_trackId_userId_key` ON `LikedTracks` (`trackId`,`userId`);
--> statement-breakpoint
-- TopSongs -> TopTracks
ALTER TABLE `TopSongs` RENAME TO `TopTracks`;
--> statement-breakpoint
DROP INDEX IF EXISTS `TopSongs_id_key`;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `TopTracks_id_key` ON `TopTracks` (`id`);
--> statement-breakpoint
-- _TopSongsToTrack -> _TopTracksToTrack
ALTER TABLE `_TopSongsToTrack` RENAME TO `_TopTracksToTrack`;
--> statement-breakpoint
DROP INDEX IF EXISTS `TopSongsToTrack_B_idx`;
--> statement-breakpoint
DROP INDEX IF EXISTS `_TopSongsToTrack_AB_unique`;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `TopTracksToTrack_B_idx` ON `_TopTracksToTrack` (`B`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `_TopTracksToTrack_AB_unique` ON `_TopTracksToTrack` (`A`,`B`);
