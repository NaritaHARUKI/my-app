CREATE TABLE `merchandises` (
	`id` varchar(255) NOT NULL,
	`lineId` varchar(255),
	`name` varchar(255),
	`img_path` varchar(255),
	`price` int,
	`stock` int,
	`description` varchar(255),
	`is_locked` boolean DEFAULT false,
	CONSTRAINT `merchandises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `status` (
	`lineId` varchar(255) NOT NULL,
	`shop_status` varchar(255),
	`merchandise_status` varchar(255),
	CONSTRAINT `status_lineId` PRIMARY KEY(`lineId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`lineId` varchar(255) NOT NULL,
	`name` varchar(255),
	`type` varchar(255),
	CONSTRAINT `users_lineId` PRIMARY KEY(`lineId`)
);
