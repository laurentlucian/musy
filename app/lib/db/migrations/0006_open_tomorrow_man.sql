CREATE TABLE `Stats` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`year` integer NOT NULL,
	`played` integer DEFAULT 0 NOT NULL,
	`liked` integer DEFAULT 0 NOT NULL,
	`minutes` numeric DEFAULT 0 NOT NULL,
	`song` text,
	`artist` text,
	`album` text,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Stats_userId_year_key` ON `Stats` (`userId`,`year`);