CREATE TABLE `invitation_code_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`code_id` text NOT NULL,
	`used_by` text NOT NULL,
	`used_at` integer,
	FOREIGN KEY (`code_id`) REFERENCES `invitation_codes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`used_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invitation_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`created_by` text NOT NULL,
	`organization_id` text NOT NULL,
	`description` text,
	`max_uses` integer DEFAULT 1,
	`used_count` integer DEFAULT 0,
	`expires_at` integer NOT NULL,
	`is_active` integer DEFAULT true,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitation_codes_code_unique` ON `invitation_codes` (`code`);