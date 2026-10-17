CREATE TABLE `website_content` (
	`id` text PRIMARY KEY NOT NULL,
	`draft_json` text NOT NULL,
	`published_json` text,
	`revision` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text
);
