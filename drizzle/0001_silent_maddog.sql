CREATE TABLE `boq_estimates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`projectName` varchar(255) NOT NULL,
	`projectLocation` varchar(255),
	`clientName` varchar(255),
	`projectRef` varchar(64),
	`description` text,
	`status` enum('draft','submitted','approved') NOT NULL DEFAULT 'draft',
	`grandTotal` decimal(14,2) NOT NULL DEFAULT '0.00',
	`hasValidationFlags` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boq_estimates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boq_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`estimateId` int NOT NULL,
	`rateItemId` int,
	`itemCode` varchar(32) NOT NULL,
	`description` text NOT NULL,
	`unit` varchar(32) NOT NULL,
	`quantity` decimal(12,3) NOT NULL,
	`unitRate` decimal(12,2) NOT NULL,
	`lineTotal` decimal(14,2) NOT NULL,
	`rateMin` decimal(12,2),
	`rateMax` decimal(12,2),
	`isFlagged` boolean NOT NULL DEFAULT false,
	`flagReason` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boq_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractor_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`cidbNumber` varchar(64),
	`ogpcNumber` varchar(64),
	`cidbGrade` varchar(32),
	`ogpcCategory` varchar(64),
	`contactPerson` varchar(128),
	`phone` varchar(32),
	`address` text,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `contractor_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `rate_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(16) NOT NULL,
	`name` varchar(128) NOT NULL,
	`trade` enum('civil','mechanical','electrical','piping') NOT NULL,
	`description` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `rate_categories_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `rate_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versionId` int NOT NULL,
	`categoryId` int NOT NULL,
	`code` varchar(32) NOT NULL,
	`description` text NOT NULL,
	`unit` varchar(32) NOT NULL,
	`rateMin` decimal(12,2) NOT NULL,
	`rateMax` decimal(12,2) NOT NULL,
	`rateStandard` decimal(12,2) NOT NULL,
	`remarks` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rate_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`year` int NOT NULL,
	`label` varchar(64) NOT NULL,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`publishedBy` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_versions_id` PRIMARY KEY(`id`)
);
