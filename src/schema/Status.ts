import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const status = mysqlTable('status', (table) => {
  return {
    lineId: varchar('lineId', { length: 255 }).primaryKey(),
    shop_status: varchar('shop_status', { length: 255 }),
    merchandise_status: varchar('merchandise_status', { length: 255 }),
  }
})

export type Status = typeof status