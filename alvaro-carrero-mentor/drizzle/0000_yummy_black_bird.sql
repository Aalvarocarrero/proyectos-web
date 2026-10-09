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
CREATE INDEX `feedback_created_at_idx` ON `feedback` (`created_at`);