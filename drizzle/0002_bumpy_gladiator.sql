ALTER TABLE `contractor_profiles` DROP INDEX `contractor_profiles_userId_unique`;--> statement-breakpoint
ALTER TABLE `rate_categories` DROP INDEX `rate_categories_code_unique`;--> statement-breakpoint
ALTER TABLE `boq_estimates` MODIFY COLUMN `projectRef` varchar(100);--> statement-breakpoint
ALTER TABLE `boq_estimates` MODIFY COLUMN `grandTotal` decimal(16,2) NOT NULL DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `boq_line_items` MODIFY COLUMN `itemCode` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `boq_line_items` MODIFY COLUMN `unit` varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE `boq_line_items` MODIFY COLUMN `lineTotal` decimal(16,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `boq_line_items` MODIFY COLUMN `flagReason` varchar(255);--> statement-breakpoint
ALTER TABLE `boq_line_items` MODIFY COLUMN `sortOrder` int;--> statement-breakpoint
ALTER TABLE `contractor_profiles` MODIFY COLUMN `cidbNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `contractor_profiles` MODIFY COLUMN `ogpcNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `contractor_profiles` MODIFY COLUMN `cidbGrade` varchar(20);--> statement-breakpoint
ALTER TABLE `contractor_profiles` MODIFY COLUMN `ogpcCategory` varchar(50);--> statement-breakpoint
ALTER TABLE `contractor_profiles` MODIFY COLUMN `contactPerson` varchar(255);--> statement-breakpoint
ALTER TABLE `contractor_profiles` MODIFY COLUMN `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `rate_categories` MODIFY COLUMN `code` varchar(50);--> statement-breakpoint
ALTER TABLE `rate_categories` MODIFY COLUMN `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `rate_categories` MODIFY COLUMN `sortOrder` int;--> statement-breakpoint
ALTER TABLE `rate_items` MODIFY COLUMN `categoryId` int;--> statement-breakpoint
ALTER TABLE `rate_items` MODIFY COLUMN `code` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `rate_items` MODIFY COLUMN `unit` varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE `rate_versions` MODIFY COLUMN `label` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `boq_estimates` ADD `versionId` int;--> statement-breakpoint
ALTER TABLE `rate_items` ADD `sortOrder` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `boq_estimates` ADD CONSTRAINT `boq_estimates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boq_estimates` ADD CONSTRAINT `boq_estimates_versionId_rate_versions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `rate_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boq_line_items` ADD CONSTRAINT `boq_line_items_estimateId_boq_estimates_id_fk` FOREIGN KEY (`estimateId`) REFERENCES `boq_estimates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boq_line_items` ADD CONSTRAINT `boq_line_items_rateItemId_rate_items_id_fk` FOREIGN KEY (`rateItemId`) REFERENCES `rate_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contractor_profiles` ADD CONSTRAINT `contractor_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_items` ADD CONSTRAINT `rate_items_versionId_rate_versions_id_fk` FOREIGN KEY (`versionId`) REFERENCES `rate_versions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rate_items` ADD CONSTRAINT `rate_items_categoryId_rate_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `rate_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boq_line_items` DROP COLUMN `updatedAt`;--> statement-breakpoint
ALTER TABLE `rate_categories` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `rate_versions` DROP COLUMN `publishedBy`;--> statement-breakpoint
ALTER TABLE `rate_versions` DROP COLUMN `notes`;