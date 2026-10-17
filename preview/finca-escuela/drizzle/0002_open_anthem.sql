CREATE TABLE `knowledge_articles` (
	`slug` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`emoji` text DEFAULT '🌿' NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`body_json` text NOT NULL,
	`keywords` text DEFAULT '' NOT NULL,
	`read_minutes` integer DEFAULT 5 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_knowledge_articles_status_updated` ON `knowledge_articles` (`status`,`updated_at`);--> statement-breakpoint
ALTER TABLE `farms` ADD `boundary_shape` text DEFAULT 'Irregular / polígono' NOT NULL;--> statement-breakpoint
ALTER TABLE `farms` ADD `boundary_json` text DEFAULT '{}' NOT NULL;