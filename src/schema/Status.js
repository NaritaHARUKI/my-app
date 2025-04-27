import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
export const status = mysqlTable('status', (table) => {
    return {
        lineId: varchar('lineId', { length: 255 }).primaryKey(),
        shopStatus: varchar('shop_status', { length: 255 }),
        merchandiseStatus: varchar('merchandise_status', { length: 255 }),
    };
});
