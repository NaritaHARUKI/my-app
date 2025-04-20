import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const shopStaions = mysqlTable('users_stations', (table) => {
  return {
    shopId: int('shopId').primaryKey(),
    stationId: int('stationId'),
  }
})

export type UserStaions = typeof shopStaions