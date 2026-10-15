CREATE TABLE `content_media` (
	`key` text PRIMARY KEY NOT NULL,
	`content_type` text NOT NULL,
	`bytes` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
