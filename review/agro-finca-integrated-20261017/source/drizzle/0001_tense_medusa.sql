CREATE TABLE `feedback_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`area` text NOT NULL,
	`role` text NOT NULL,
	`message` text NOT NULL,
	`contact` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_feedback_status_area` ON `feedback_submissions` (`status`,`area`);--> statement-breakpoint
CREATE TABLE `passkey_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`webauthn_user_id` text NOT NULL,
	`public_key` text NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`device_type` text NOT NULL,
	`backed_up` integer DEFAULT false NOT NULL,
	`transports` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL,
	`last_used_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_passkeys_user` ON `passkey_credentials` (`user_id`);--> statement-breakpoint
CREATE TABLE `professionals` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`profession` text NOT NULL,
	`specialties` text NOT NULL,
	`state` text NOT NULL,
	`municipality` text DEFAULT '' NOT NULL,
	`service_mode` text NOT NULL,
	`introduction` text NOT NULL,
	`contact` text NOT NULL,
	`credential_note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_professionals_status_state` ON `professionals` (`status`,`state`);--> statement-breakpoint
CREATE TABLE `project_proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`sector` text NOT NULL,
	`state` text NOT NULL,
	`summary` text NOT NULL,
	`has_json` text NOT NULL,
	`needs_json` text NOT NULL,
	`impact` text NOT NULL,
	`requested_support` text NOT NULL,
	`contact` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_projects_status_sector` ON `project_proposals` (`status`,`sector`);--> statement-breakpoint
CREATE TABLE `security_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`challenge` text NOT NULL,
	`webauthn_user_id` text,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`consumed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_security_challenges_user_purpose` ON `security_challenges` (`user_id`,`purpose`);--> statement-breakpoint
CREATE TABLE `trusted_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`label` text NOT NULL,
	`platform` text,
	`timezone` text,
	`connection_class` text,
	`network_hint_hash` text,
	`country_code` text,
	`last_verified_at` text,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_trusted_devices_user` ON `trusted_devices` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_trusted_devices_token` ON `trusted_devices` (`token_hash`);--> statement-breakpoint
CREATE TABLE `user_consents` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`policy_version` text NOT NULL,
	`essential_accepted` integer DEFAULT false NOT NULL,
	`public_content_accepted` integer DEFAULT false NOT NULL,
	`security_signals_accepted` integer DEFAULT false NOT NULL,
	`accepted_at` text NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_user_consents_user` ON `user_consents` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_user_consents_user_version` ON `user_consents` (`user_id`,`policy_version`);--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `state` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `municipality` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `short_intro` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `photo_context` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `seo_title` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `seo_description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `image_alt` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `phone_e164` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone_verified_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `last_seen_at` text;
--> statement-breakpoint
PRAGMA optimize;
