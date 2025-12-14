-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `_prisma_migrations` (
	`id` text PRIMARY KEY NOT NULL,
	`checksum` text NOT NULL,
	`finished_at` numeric,
	`migration_name` text NOT NULL,
	`logs` text,
	`rolled_back_at` numeric,
	`started_at` numeric DEFAULT (current_timestamp) NOT NULL,
	`applied_steps_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PlaylistTrack` (
	`addedAt` numeric NOT NULL,
	`playlistId` text NOT NULL,
	`trackId` text NOT NULL,
	`feedId` integer,
	FOREIGN KEY (`feedId`) REFERENCES `Feed`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PlaylistTrack_playlistId_trackId_key` ON `PlaylistTrack` (`playlistId`,`trackId`);--> statement-breakpoint
CREATE UNIQUE INDEX `PlaylistTrack_feedId_key` ON `PlaylistTrack` (`feedId`);--> statement-breakpoint
CREATE TABLE `Generated` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`userId` text NOT NULL,
	`mood` text,
	`taste` text,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Generated_userId_key` ON `Generated` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `AI_userId_key` ON `Generated` (`userId`);--> statement-breakpoint
CREATE TABLE `Feed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `Feed_createdAt_idx` ON `Feed` (`createdAt`);--> statement-breakpoint
CREATE TABLE `Follow` (
	`followingId` text NOT NULL,
	`followerId` text NOT NULL,
	PRIMARY KEY(`followingId`, `followerId`),
	FOREIGN KEY (`followerId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`followingId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `LikedSongs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`trackId` text NOT NULL,
	`userId` text NOT NULL,
	`action` text DEFAULT 'liked' NOT NULL,
	`feedId` integer,
	FOREIGN KEY (`feedId`) REFERENCES `Feed`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `LikedSongs_trackId_userId_key` ON `LikedSongs` (`trackId`,`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `LikedSongs_feedId_key` ON `LikedSongs` (`feedId`);--> statement-breakpoint
CREATE TABLE `Playback` (
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
CREATE UNIQUE INDEX `Playback_userId_key` ON `Playback` (`userId`);--> statement-breakpoint
CREATE TABLE `PlaybackHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`startedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`endedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`userId` text NOT NULL,
	`feedId` integer,
	FOREIGN KEY (`feedId`) REFERENCES `Feed`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `PlaybackHistory_feedId_key` ON `PlaybackHistory` (`feedId`);--> statement-breakpoint
CREATE TABLE `Recommended` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`trackId` text NOT NULL,
	`userId` text NOT NULL,
	`caption` text,
	`action` text DEFAULT 'recommend' NOT NULL,
	`feedId` integer,
	FOREIGN KEY (`feedId`) REFERENCES `Feed`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Recommended_feedId_key` ON `Recommended` (`feedId`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`newId` text
);
--> statement-breakpoint
CREATE TABLE `Provider` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text NOT NULL,
	`accountId` text NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`tokenType` text NOT NULL,
	`revoked` numeric DEFAULT false NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Provider_accountId_type_key` ON `Provider` (`accountId`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `Provider_userId_type_key` ON `Provider` (`userId`,`type`);--> statement-breakpoint
CREATE TABLE `Profile` (
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
CREATE UNIQUE INDEX `Profile_email_key` ON `Profile` (`email`);--> statement-breakpoint
CREATE TABLE `RecentSongs` (
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
CREATE UNIQUE INDEX `RecentSongs_playedAt_userId_key` ON `RecentSongs` (`playedAt`,`userId`);--> statement-breakpoint
CREATE TABLE `Track` (
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
CREATE UNIQUE INDEX `Track_id_key` ON `Track` (`id`);--> statement-breakpoint
CREATE TABLE `Thanks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`trackId` text NOT NULL,
	`userId` text,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `Playlist` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`uri` text NOT NULL,
	`image` text NOT NULL,
	`userId` text NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`provider` text DEFAULT 'spotify' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Playlist_id_key` ON `Playlist` (`id`);--> statement-breakpoint
CREATE TABLE `Sync` (
	`userId` text NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	`state` text NOT NULL,
	`type` text NOT NULL,
	PRIMARY KEY(`userId`, `state`, `type`)
);
--> statement-breakpoint
CREATE TABLE `Transfer` (
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	`userId` text NOT NULL,
	`state` text NOT NULL,
	`type` text NOT NULL,
	`source` text NOT NULL,
	`destination` text NOT NULL,
	`skip` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`nextAfter` numeric,
	PRIMARY KEY(`userId`, `type`, `source`, `destination`)
);
--> statement-breakpoint
CREATE TABLE `GeneratedPlaylist` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`mood` text NOT NULL,
	`year` integer NOT NULL,
	`ownerId` integer NOT NULL,
	`familiar` numeric,
	`popular` numeric,
	FOREIGN KEY (`ownerId`) REFERENCES `Generated`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `GeneratedPlaylist_id_key` ON `GeneratedPlaylist` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `AIPlaylist_id_key` ON `GeneratedPlaylist` (`id`);--> statement-breakpoint
CREATE TABLE `_GeneratedPlaylistToTrack` (
	`A` text NOT NULL,
	`B` text NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `GeneratedPlaylist`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `_GeneratedPlaylistToTrack_B_index` ON `_GeneratedPlaylistToTrack` (`B`);--> statement-breakpoint
CREATE UNIQUE INDEX `_GeneratedPlaylistToTrack_AB_unique` ON `_GeneratedPlaylistToTrack` (`A`,`B`);--> statement-breakpoint
CREATE TABLE `_TopSongsToTrack` (
	`A` text NOT NULL,
	`B` text NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `TopSongs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `_TopSongsToTrack_B_index` ON `_TopSongsToTrack` (`B`);--> statement-breakpoint
CREATE UNIQUE INDEX `_TopSongsToTrack_AB_unique` ON `_TopSongsToTrack` (`A`,`B`);--> statement-breakpoint
CREATE TABLE `Artist` (
	`id` text PRIMARY KEY NOT NULL,
	`uri` text NOT NULL,
	`name` text NOT NULL,
	`image` text NOT NULL,
	`popularity` integer NOT NULL,
	`followers` integer NOT NULL,
	`genres` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Album` (
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
CREATE TABLE `Top` (
	`userId` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Top_userId_key` ON `Top` (`userId`);--> statement-breakpoint
CREATE TABLE `TopArtists` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text NOT NULL,
	`artistIds` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Top`(`userId`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `TopArtists_id_key` ON `TopArtists` (`id`);--> statement-breakpoint
CREATE TABLE `_ArtistToTopArtists` (
	`A` text NOT NULL,
	`B` text NOT NULL,
	FOREIGN KEY (`B`) REFERENCES `TopArtists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`A`) REFERENCES `Artist`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `_ArtistToTopArtists_B_index` ON `_ArtistToTopArtists` (`B`);--> statement-breakpoint
CREATE UNIQUE INDEX `_ArtistToTopArtists_AB_unique` ON `_ArtistToTopArtists` (`A`,`B`);--> statement-breakpoint
CREATE TABLE `TopSongs` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`type` text NOT NULL,
	`trackIds` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Top`(`userId`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `TopSongs_id_key` ON `TopSongs` (`id`);
*/