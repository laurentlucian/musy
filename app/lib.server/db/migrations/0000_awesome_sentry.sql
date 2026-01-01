-- Current sql file was generated after introspecting the database
CREATE TABLE IF NOT EXISTS `Playback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	`userId` text NOT NULL,
	`trackId` text NOT NULL,
	`timestamp` integer DEFAULT 0 NOT NULL,
	`progress` integer NOT NULL,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Playback_userId_key` ON `Playback` (`userId`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `User` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`newId` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Profile` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`name` text,
	`bio` text,
	`email` text NOT NULL,
	`image` text,
	FOREIGN KEY (`id`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Profile_email_key` ON `Profile` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `RecentSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`trackId` text NOT NULL,
	`userId` text NOT NULL,
	`action` text DEFAULT 'recent' NOT NULL,
	`sessionId` integer,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `RecentSongs_playedAt_userId_key` ON `RecentSongs` (`playedAt`,`userId`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Track` (
	`id` text PRIMARY KEY NOT NULL,
	`uri` text NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`albumUri` text NOT NULL,
	`albumName` text NOT NULL,
	`artist` text NOT NULL,
	`artistUri` text NOT NULL,
	`explicit` numeric NOT NULL,
	`preview_url` text,
	`link` text NOT NULL,
	`duration` integer NOT NULL,
	`provider` text DEFAULT 'spotify' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Track_id_key` ON `Track` (`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Playlist` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`uri` text NOT NULL,
	`image` text NOT NULL,
	`userId` text NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`provider` text DEFAULT 'spotify' NOT NULL,
	`snapshot_id` text,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Playlist_id_key` ON `Playlist` (`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Sync` (
	`userId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	`state` text NOT NULL,
	`type` text NOT NULL,
	PRIMARY KEY(`userId`, `state`, `type`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `_TopSongsToTrack` (
	`A` text NOT NULL,
	`B` text NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `TopSongs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `TopSongsToTrack_B_idx` ON `_TopSongsToTrack` (`B`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `_TopSongsToTrack_AB_unique` ON `_TopSongsToTrack` (`A`,`B`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Artist` (
	`id` text PRIMARY KEY NOT NULL,
	`uri` text NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`popularity` integer NOT NULL,
	`followers` integer NOT NULL,
	`genres` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Album` (
	`id` text PRIMARY KEY NOT NULL,
	`uri` text NOT NULL,
	`type` text NOT NULL,
	`total` text NOT NULL,
	`image` text NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`artistId` text NOT NULL,
	FOREIGN KEY (`artistId`) REFERENCES `Artist`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Top` (
	`userId` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Top_userId_key` ON `Top` (`userId`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `TopArtists` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text NOT NULL,
	`artistIds` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Top`(`userId`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `TopArtists_id_key` ON `TopArtists` (`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `_ArtistToTopArtists` (
	`A` text NOT NULL,
	`B` text NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `TopArtists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `Artist`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ArtistToTopArtists_B_idx` ON `_ArtistToTopArtists` (`B`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `_ArtistToTopArtists_AB_unique` ON `_ArtistToTopArtists` (`A`,`B`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `TopSongs` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text NOT NULL,
	`trackIds` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Top`(`userId`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `TopSongs_id_key` ON `TopSongs` (`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `Provider` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text NOT NULL,
	`accountId` text NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`tokenType` text NOT NULL,
	`revoked` numeric NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Provider_userId_type_key` ON `Provider` (`userId`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `Provider_accountId_type_key` ON `Provider` (`accountId`,`type`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `PlaylistTrack` (
	`addedAt` numeric NOT NULL,
	`playlistId` text NOT NULL,
	`trackId` text NOT NULL,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `PlaylistTrack_playlistId_trackId_key` ON `PlaylistTrack` (`playlistId`,`trackId`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `LikedSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`trackId` text NOT NULL,
	`userId` text NOT NULL,
	`action` text DEFAULT 'liked' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `LikedSongs_trackId_userId_key` ON `LikedSongs` (`trackId`,`userId`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `PlaybackHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`endedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);