import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { shops } from './Shop.ts';
export const shopStations = mysqlTable('shop_stations', (table) => {
    return {
        shopId: int('shopId').notNull().references(() => shops.id),
        stationId: int('stationId').notNull(),
    };
}, (table) => ({
    pk: [table.shopId, table.stationId],
}));
