// Shop.ts
import { relations } from 'drizzle-orm'
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { shopStations } from './ShopStations.ts'
import { shopUsers } from './ShopUsers.ts'

export const shops = mysqlTable('shops', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    address: varchar('address', { length: 255 }),
    url: varchar('url', { length: 255 }),
    description: varchar('description', { length: 255 }),
    station_id: int('station_id'),
  }
})

export const shopRelations = relations(shops, ({ many }) => ({
  shopStations: many(shopStations),
  shopUsers: many(shopUsers),
}))

export type Shops = typeof shops
