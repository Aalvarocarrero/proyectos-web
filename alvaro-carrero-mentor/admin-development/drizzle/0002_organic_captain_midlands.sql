CREATE TABLE `learning_notes` (
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
