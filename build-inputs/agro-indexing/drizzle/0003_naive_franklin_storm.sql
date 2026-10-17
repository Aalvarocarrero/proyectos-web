ALTER TABLE `marketplace_listings` ADD `sale_format` text DEFAULT 'A convenir' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `supply_unit` text DEFAULT 'unidad' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `minimum_order` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `marketplace_listings` ADD `buyer_type` text DEFAULT 'Personas y empresas' NOT NULL;