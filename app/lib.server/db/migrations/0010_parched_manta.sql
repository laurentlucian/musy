PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new__QueueItemDelivery` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`queueItemId` text NOT NULL,
	`userId` text NOT NULL,
	`reaction` text,
	FOREIGN KEY (`queueItemId`) REFERENCES `QueueItem`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `Profile`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new__QueueItemDelivery`("id", "created_at", "updated_at", "queueItemId", "userId", "reaction") SELECT "id", "created_at", "updated_at", "queueItemId", "userId", "reaction" FROM `_QueueItemDelivery`;--> statement-breakpoint
DROP TABLE `_QueueItemDelivery`;--> statement-breakpoint
ALTER TABLE `__new__QueueItemDelivery` RENAME TO `_QueueItemDelivery`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `_QueueItemDelivery_userId_idx` ON `_QueueItemDelivery` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `_QueueItemDelivery_queueItemId_userId_key` ON `_QueueItemDelivery` (`queueItemId`,`userId`);