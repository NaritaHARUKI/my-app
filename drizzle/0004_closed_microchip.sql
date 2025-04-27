ALTER TABLE `merchandises` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_stations` MODIFY COLUMN `shopId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_stations` MODIFY COLUMN `stationId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `merchandises` ADD `shopId` int;--> statement-breakpoint
ALTER TABLE `shop_stations` ADD CONSTRAINT `shop_stations_shopId_shops_id_fk` FOREIGN KEY (`shopId`) REFERENCES `shops`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shops` DROP COLUMN `stationId`;