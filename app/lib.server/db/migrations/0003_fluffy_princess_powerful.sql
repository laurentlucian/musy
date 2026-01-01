CREATE TABLE `_TrackToArtist` (
	`trackId` text NOT NULL,
	`artistId` text NOT NULL,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`artistId`) REFERENCES `Artist`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `TrackToArtist_artistId_idx` ON `_TrackToArtist` (`artistId`);--> statement-breakpoint
CREATE UNIQUE INDEX `_TrackToArtist_trackId_artistId_unique` ON `_TrackToArtist` (`trackId`,`artistId`);--> statement-breakpoint
ALTER TABLE `Track` ADD `albumId` text REFERENCES Album(id);