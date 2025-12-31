DROP INDEX `_GeneratedPlaylistToTrack_B_index`;--> statement-breakpoint
CREATE INDEX `GeneratedPlaylistToTrack_B_idx` ON `_GeneratedPlaylistToTrack` (`B`);--> statement-breakpoint
DROP INDEX `_TopSongsToTrack_B_index`;--> statement-breakpoint
CREATE INDEX `TopSongsToTrack_B_idx` ON `_TopSongsToTrack` (`B`);--> statement-breakpoint
DROP INDEX `_ArtistToTopArtists_B_index`;--> statement-breakpoint
CREATE INDEX `ArtistToTopArtists_B_idx` ON `_ArtistToTopArtists` (`B`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Provider` (
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
INSERT INTO `__new_Provider`("id", "createdAt", "updatedAt", "type", "accountId", "accessToken", "refreshToken", "expiresAt", "tokenType", "revoked", "userId") SELECT "id", "createdAt", "updatedAt", "type", "accountId", "accessToken", "refreshToken", "expiresAt", "tokenType", "revoked", "userId" FROM `Provider`;--> statement-breakpoint
DROP TABLE `Provider`;--> statement-breakpoint
ALTER TABLE `__new_Provider` RENAME TO `Provider`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `Provider_accountId_type_key` ON `Provider` (`accountId`,`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `Provider_userId_type_key` ON `Provider` (`userId`,`type`);--> statement-breakpoint
ALTER TABLE `Playlist` ADD `snapshot_id` text;