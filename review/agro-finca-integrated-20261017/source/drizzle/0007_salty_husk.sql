CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`revision` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`state` text NOT NULL,
	`municipality` text DEFAULT '' NOT NULL,
	`description` text NOT NULL,
	`profile_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_companies_status_category` ON `companies` (`status`,`category`);--> statement-breakpoint
CREATE INDEX `idx_companies_status_state` ON `companies` (`status`,`state`);--> statement-breakpoint
CREATE INDEX `idx_companies_owner` ON `companies` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_companies_updated` ON `companies` (`updated_at`);