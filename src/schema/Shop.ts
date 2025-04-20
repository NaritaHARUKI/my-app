import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const shops = mysqlTable('status', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    lineId: varchar('lineId', { length: 255 }),
    name: varchar('name', { length: 255 }),
    address: varchar('address', { length: 255 }),
    url: varchar('url', { length: 255 }),
    station_id: varchar('stationId', { length: 255 }),
  }
})

export type Shops = typeof shops