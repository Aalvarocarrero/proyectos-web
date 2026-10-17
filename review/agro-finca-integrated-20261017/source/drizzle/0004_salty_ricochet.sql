CREATE TABLE `community_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`post_id` text NOT NULL,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_community_comments_post_status` ON `community_comments` (`post_id`,`status`);--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`farm_id` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_community_posts_status_date` ON `community_posts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_community_posts_farm` ON `community_posts` (`farm_id`);--> statement-breakpoint
CREATE TABLE `community_reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`post_id` text NOT NULL,
	`liked` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_community_reactions_post` ON `community_reactions` (`post_id`);--> statement-breakpoint
CREATE TABLE `public_farm_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`state` text NOT NULL,
	`profile_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_public_farms_status_state` ON `public_farm_profiles` (`status`,`state`);--> statement-breakpoint
CREATE INDEX `idx_public_farms_owner` ON `public_farm_profiles` (`owner_id`);