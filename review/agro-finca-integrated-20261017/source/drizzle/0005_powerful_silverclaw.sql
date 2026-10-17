ALTER TABLE `community_comments` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `community_comments` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `community_comments` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `community_posts` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `community_posts` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `community_posts` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `farm_records` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farm_records` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `farm_records` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `farms` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `farms` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `farms` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `professionals` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `professionals` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `project_proposals` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_proposals` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `project_proposals` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `public_farm_profiles` ADD `revision` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `public_farm_profiles` ADD `last_operation_id` text;--> statement-breakpoint
ALTER TABLE `public_farm_profiles` ADD `last_operation_hash` text;--> statement-breakpoint
ALTER TABLE `sync_receipts` ADD `operation_hash` text;