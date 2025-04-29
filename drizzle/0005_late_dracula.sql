ALTER TABLE `users_stations` MODIFY COLUMN `stationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `merchandises` ADD `flex_message` varchar(255);--> statement-breakpoint
ALTER TABLE `status` ADD `user_status` varchar(255);