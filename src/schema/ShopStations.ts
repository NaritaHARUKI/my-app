import { int, mysqlTable } from 'drizzle-orm/mysql-core'
import { shops } from './Shop.ts'
import { relations } from 'drizzle-orm'

export const shopStations = mysqlTable('shop_stations', (table) => {
  return {
    shop_id: int('shop_id').notNull().references(() => shops.id),
    station_id: int('station_id').notNull(),
  }
})

export const shopStationRelations = relations(shopStations, ({ one }) => ({
  shop: one(shops, {
    fields: [shopStations.shop_id],
    references: [shops.id],
  }),
}))

export type ShopStations = typeof shopStations
