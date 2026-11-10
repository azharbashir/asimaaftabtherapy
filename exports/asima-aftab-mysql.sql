-- Asima Aftab Psychotherapy: MySQL schema for Hostinger/phpMyAdmin
-- Select your EMPTY application database in phpMyAdmin, then import this file.
-- Schema only: no passwords, customer data, bookings, or sample reviews.
-- Run npm start afterward to create the first admin from private ADMIN_* settings.
-- Existing installations should use npm run db:setup instead of importing this file.

SET NAMES utf8mb4;

-- 0000_closed_mentallo
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `content` (
	`id` varchar(64) NOT NULL,
	`value` longtext NOT NULL,
	CONSTRAINT `content_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `images` (
	`id` varchar(64) NOT NULL,
	`mime` varchar(80) NOT NULL,
	`data` longtext NOT NULL,
	`created_at` varchar(30) NOT NULL,
	CONSTRAINT `images_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `login_attempts` (
	`email` varchar(254) NOT NULL,
	`count` int NOT NULL,
	`reset_at` varchar(30) NOT NULL,
	CONSTRAINT `login_attempts_email` PRIMARY KEY(`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`expires_at` varchar(30) NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;

CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);

-- 0001_busy_layla_miller
CREATE TABLE `reviews` (
	`id` varchar(64) NOT NULL,
	`service` varchar(200) NOT NULL,
	`rating` int NOT NULL,
	`display_name` varchar(80) NOT NULL DEFAULT 'Anonymous',
	`body` text NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`created_at` varchar(30) NOT NULL,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `reviews_status_service_idx` ON `reviews` (`status`,`service`);

CREATE INDEX `reviews_created_at_idx` ON `reviews` (`created_at`);

-- Record the imported schema so app startup does not create the tables again.
CREATE TABLE `__drizzle_migrations` (
  `id` SERIAL PRIMARY KEY,
  `hash` TEXT NOT NULL,
  `created_at` BIGINT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `__drizzle_migrations` (`hash`,`created_at`) VALUES ('abb606ebbbf72197307ef1c1b043f574739126251aabf1746710802600a5839f',1794302198257);
INSERT INTO `__drizzle_migrations` (`hash`,`created_at`) VALUES ('dd46fce4fb6eb31198c60be8a1a6158e08f54a6061b65441ce84c04fcb5c408a',1794318554551);
