CREATE TABLE `QueueGroup` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `_QueueGroupToUser` (
	`groupId` text NOT NULL,
	`userId` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`groupId`) REFERENCES `QueueGroup`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `_QueueGroupToUser_userId_groupId_key` ON `_QueueGroupToUser` (`userId`,`groupId`);--> statement-breakpoint
CREATE INDEX `_QueueGroupToUser_userId_idx` ON `_QueueGroupToUser` (`userId`);--> statement-breakpoint
CREATE TABLE `QueueItem` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`groupId` text NOT NULL,
	`trackId` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`groupId`) REFERENCES `QueueGroup`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`trackId`) REFERENCES `Track`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `QueueItem_groupId_idx` ON `QueueItem` (`groupId`);--> statement-breakpoint
CREATE TABLE `_QueueItemDelivery` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`queueItemId` text NOT NULL,
	`userId` text NOT NULL,
	`reaction` text DEFAULT 'like',
	FOREIGN KEY (`queueItemId`) REFERENCES `QueueItem`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `_QueueItemDelivery_userId_idx` ON `_QueueItemDelivery` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `_QueueItemDelivery_queueItemId_userId_key` ON `_QueueItemDelivery` (`queueItemId`,`userId`);