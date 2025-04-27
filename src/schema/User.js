import { mysqlTable, varchar } from 'drizzle-orm/mysql-core';
export const users = mysqlTable('users', (table) => {
    return {
        lineId: varchar('lineId', { length: 255 }).primaryKey(),
        name: varchar('name', { length: 255 }),
        type: varchar('type', { length: 255 }),
    };
});
