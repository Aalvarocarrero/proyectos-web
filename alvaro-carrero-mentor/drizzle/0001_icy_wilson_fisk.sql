CREATE TABLE `feedback_rate_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`requests` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_rate_limits_expiry_idx` ON `feedback_rate_limits` (`expires_at`);