CREATE TABLE `farm_records` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`farm_id` text NOT NULL,
	`record_type` text NOT NULL,
	`category` text,
	`title` text NOT NULL,
	`data_json` text NOT NULL,
	`client_updated_at` text NOT NULL,
	`server_updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`farm_id`) REFERENCES `farms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_farm_records_owner_type` ON `farm_records` (`owner_id`,`record_type`);--> statement-breakpoint
CREATE INDEX `idx_farm_records_farm_type` ON `farm_records` (`farm_id`,`record_type`);--> statement-breakpoint
CREATE INDEX `idx_farm_records_category` ON `farm_records` (`category`);--> statement-breakpoint
CREATE TABLE `farms` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`area_sq_m` integer,
	`objective` text,
	`client_updated_at` text NOT NULL,
	`server_updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_farms_owner` ON `farms` (`owner_id`);--> statement-breakpoint
CREATE TABLE `marketplace_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`seller_name` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`price_cents` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`location` text NOT NULL,
	`contact` text,
	`image_key` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`client_updated_at` text NOT NULL,
	`server_updated_at` text NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_listings_status_category` ON `marketplace_listings` (`status`,`category`);--> statement-breakpoint
CREATE INDEX `idx_listings_owner` ON `marketplace_listings` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_listings_updated` ON `marketplace_listings` (`server_updated_at`);--> statement-breakpoint
CREATE TABLE `order_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`customer_name` text NOT NULL,
	`email` text,
	`phone` text,
	`items_json` text NOT NULL,
	`note` text,
	`status` text DEFAULT 'new' NOT NULL,
	`client_updated_at` text NOT NULL,
	`server_updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_order_requests_status` ON `order_requests` (`status`);--> statement-breakpoint
CREATE INDEX `idx_order_requests_owner` ON `order_requests` (`owner_id`);--> statement-breakpoint
CREATE TABLE `sync_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sync_receipts_owner` ON `sync_receipts` (`owner_key`);--> statement-breakpoint
CREATE INDEX `idx_sync_receipts_entity` ON `sync_receipts` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);