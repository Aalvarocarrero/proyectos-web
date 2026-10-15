-- Apply only to a NEW dedicated D1 database for this website.
-- Schema only: no feedback, contacts, credentials or test rows are included.
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`language` text NOT NULL,
	`useful` text NOT NULL,
	`improve` text NOT NULL,
	`support` text NOT NULL,
	`reply_requested` integer NOT NULL,
	`name` text,
	`email` text
);
--> statement-breakpoint
CREATE INDEX `feedback_created_at_idx` ON `feedback` (`created_at`);CREATE TABLE `feedback_rate_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`requests` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_rate_limits_expiry_idx` ON `feedback_rate_limits` (`expires_at`);CREATE TABLE `learning_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`reviewed_at` integer NOT NULL,
	`summary` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `retention_runs` (
	`ran_at` integer PRIMARY KEY NOT NULL,
	`feedback_deleted` integer NOT NULL,
	`counters_deleted` integer NOT NULL
);
