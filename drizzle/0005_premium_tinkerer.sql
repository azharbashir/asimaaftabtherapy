CREATE TABLE `login_attempts` (
	`email` text PRIMARY KEY NOT NULL,
	`count` text NOT NULL,
	`reset_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `users` ADD `password_hash` text;
--> statement-breakpoint
INSERT INTO users (id,name,email,role,created_at,password_hash) VALUES ('practice-admin','Asima Aftab','asimaftabtherapy@gmail.com','admin',strftime('%Y-%m-%dT%H:%M:%fZ','now'),'b8683012-dc56-417e-a841-75471e6ee667:d570372514c82403eb80aa8253a602c15639e57fcf38014eeb7a73db8d8ee373') ON CONFLICT(email) DO UPDATE SET role='admin',password_hash=excluded.password_hash;
