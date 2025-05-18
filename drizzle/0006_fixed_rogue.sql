ALTER TABLE `shop_stations` DROP FOREIGN KEY `shop_stations_shopId_shops_id_fk`;
--> statement-breakpoint
ALTER TABLE `status` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users_stations` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `status` ADD PRIMARY KEY(`line_id`);--> statement-breakpoint
ALTER TABLE `users` ADD PRIMARY KEY(`line_id`);--> statement-breakpoint
ALTER TABLE `merchandises` ADD `last_receive_date` varchar(255);--> statement-breakpoint
ALTER TABLE `merchandises` ADD `notification_json` varchar(255);--> statement-breakpoint
ALTER TABLE `shops` ADD `description` varchar(255);--> statement-breakpoint
ALTER TABLE `shops` ADD `station_id` int;--> statement-breakpoint
ALTER TABLE `status` ADD `line_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `line_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_stations` ADD `line_id` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users_stations` ADD `station_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_stations` ADD `shop_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_stations` ADD `station_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users_stations` ADD CONSTRAINT `users_stations_line_id_users_line_id_fk` FOREIGN KEY (`line_id`) REFERENCES `users`(`line_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shop_stations` ADD CONSTRAINT `shop_stations_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `merchandises` DROP COLUMN `lineId`;--> statement-breakpoint
ALTER TABLE `merchandises` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `merchandises` DROP COLUMN `stock`;--> statement-breakpoint
ALTER TABLE `merchandises` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `merchandises` DROP COLUMN `is_locked`;--> statement-breakpoint
ALTER TABLE `merchandises` DROP COLUMN `flex_message`;--> statement-breakpoint
ALTER TABLE `shops` DROP COLUMN `lineId`;--> statement-breakpoint
ALTER TABLE `status` DROP COLUMN `lineId`;--> statement-breakpoint
ALTER TABLE `status` DROP COLUMN `user_status`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lineId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `type`;--> statement-breakpoint
ALTER TABLE `users_stations` DROP COLUMN `lineId`;--> statement-breakpoint
ALTER TABLE `users_stations` DROP COLUMN `stationId`;--> statement-breakpoint
ALTER TABLE `shop_stations` DROP COLUMN `shopId`;--> statement-breakpoint
ALTER TABLE `shop_stations` DROP COLUMN `stationId`;