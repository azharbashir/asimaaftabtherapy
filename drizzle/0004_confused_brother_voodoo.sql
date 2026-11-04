CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_auth_id_unique` ON `users` (`auth_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
INSERT INTO users (id, name, email, role, created_at) VALUES ('initial-owner', 'Azhar chaudhry', 'azhar.ch31@gmail.com', 'admin', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
