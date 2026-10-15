CREATE TABLE `catalog_media` (
	`key` text PRIMARY KEY NOT NULL,
	`content_type` text NOT NULL,
	`bytes` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `catalog_revisions` (
	`version` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `catalog_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`draft` text NOT NULL,
	`published` text NOT NULL,
	`published_version` integer NOT NULL,
	`operation_id` text NOT NULL,
	`updated_at` text NOT NULL
);
