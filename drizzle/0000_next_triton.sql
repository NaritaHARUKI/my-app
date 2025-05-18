CREATE TABLE `merchandises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int,
	`price` int,
	`last_receive_date` varchar(255),
	`img_path` varchar(255),
	`notification_json` varchar(255),
	CONSTRAINT `merchandises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`address` varchar(255),
	`url` varchar(255),
	`description` varchar(255),
	`station_id` int,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `status` (
	`line_id` varchar(255) NOT NULL,
	`shop_status` varchar(255),
	`merchandise_status` varchar(255),
	CONSTRAINT `status_line_id` PRIMARY KEY(`line_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`line_id` varchar(255) NOT NULL,
	CONSTRAINT `users_line_id` PRIMARY KEY(`line_id`)
);
--> statement-breakpoint
CREATE TABLE `users_stations` (
	`line_id` varchar(255) NOT NULL,
	`station_id` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_stations` (
	`shop_id` int NOT NULL,
	`station_id` int NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users_stations` ADD CONSTRAINT `users_stations_line_id_users_line_id_fk` FOREIGN KEY (`line_id`) REFERENCES `users`(`line_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shop_stations` ADD CONSTRAINT `shop_stations_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE no action ON UPDATE no action;