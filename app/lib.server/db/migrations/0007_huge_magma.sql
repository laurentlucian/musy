PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_Stats` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`year` integer NOT NULL,
	`played` integer DEFAULT 0 NOT NULL,
	`liked` integer DEFAULT 0 NOT NULL,
	`minutes` numeric DEFAULT '0' NOT NULL,
	`song` text,
	`trackCount` integer DEFAULT 0 NOT NULL,
	`artist` text,
	`album` text,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_Stats`("id", "userId", "year", "played", "liked", "minutes", "song", "trackCount", "artist", "album", "createdAt", "updatedAt") SELECT "id", "userId", "year", "played", "liked", "minutes", "song", "trackCount", "artist", "album", "createdAt", "updatedAt" FROM `Stats`;--> statement-breakpoint
DROP TABLE `Stats`;--> statement-breakpoint
ALTER TABLE `__new_Stats` RENAME TO `Stats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `Stats_userId_year_key` ON `Stats` (`userId`,`year`);