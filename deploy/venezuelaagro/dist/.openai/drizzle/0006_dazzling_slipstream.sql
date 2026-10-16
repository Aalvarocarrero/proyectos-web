ALTER TABLE `sync_receipts` ADD `receipt_status` text DEFAULT 'accepted' NOT NULL;--> statement-breakpoint
ALTER TABLE `sync_receipts` ADD `server_revision` text;