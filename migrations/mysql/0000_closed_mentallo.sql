CREATE TABLE `appointments` (
	`id` varchar(64) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(254) NOT NULL,
	`phone` varchar(40),
	`session_type` varchar(80),
	`message` text,
	`service` varchar(120) NOT NULL,
	`date` varchar(10) NOT NULL,
	`timezone` varchar(100) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'New',
	`created_at` varchar(30) NOT NULL,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content` (
	`id` varchar(64) NOT NULL,
	`value` longtext NOT NULL,
	CONSTRAINT `content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `images` (
	`id` varchar(64) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`data` longtext NOT NULL,
	`created_at` varchar(30) NOT NULL,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`email` varchar(254) NOT NULL,
	`count` int NOT NULL,
	`reset_at` varchar(30) NOT NULL,
	CONSTRAINT `login_attempts_email` PRIMARY KEY(`email`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`expires_at` varchar(30) NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`auth_id` varchar(254),
	`password_hash` varchar(255),
	`name` varchar(120) NOT NULL,
	`email` varchar(254) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`created_at` varchar(30) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_auth_id_unique` UNIQUE(`auth_id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);