CREATE TABLE `content_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot` text NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `content_revisions_created_at_idx` ON `content_revisions` (`created_at`);--> statement-breakpoint
CREATE TABLE `content_state` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_version` integer NOT NULL,
	`version` integer NOT NULL,
	`draft` text NOT NULL,
	`published` text,
	`published_version` integer,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL,
	`operation_id` text NOT NULL
);
