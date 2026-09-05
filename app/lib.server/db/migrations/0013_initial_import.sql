CREATE TABLE `InitialImport` (
	`userId` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`stage` text DEFAULT 'recent' NOT NULL,
	`imported` integer DEFAULT 0 NOT NULL,
	`total` integer,
	`offset` integer DEFAULT 0 NOT NULL,
	`year` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`updatedAt` integer NOT NULL,
	`lease` text,
	`retryAt` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
