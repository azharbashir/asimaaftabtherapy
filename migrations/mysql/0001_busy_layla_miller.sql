CREATE TABLE `reviews` (
	`id` varchar(64) NOT NULL,
	`service` varchar(200) NOT NULL,
	`rating` int NOT NULL,
	`display_name` varchar(80) NOT NULL DEFAULT 'Anonymous',
	`body` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` varchar(30) NOT NULL,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `reviews_status_service_idx` ON `reviews` (`status`,`service`);--> statement-breakpoint
CREATE INDEX `reviews_created_at_idx` ON `reviews` (`created_at`);