CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lineId` varchar(255),
	`name` varchar(255),
	`address` varchar(255),
	`url` varchar(255),
	`stationId` varchar(255),
	CONSTRAINT `shops_id` PRIMARY KEY(`id`)
);
