import { int, mysqlTable } from 'drizzle-orm/mysql-core'

export const shopStaions = mysqlTable('shop_stations', (table) => {
  return {
    shopId: int('shopId'),
    stationId: int('stationId'),
  }
})

export type ShopStaions = typeof shopStaions