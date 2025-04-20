import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const userStaions = mysqlTable('users_stations', (table) => {
  return {
    lineId: varchar('lineId', { length: 255 }).primaryKey(),
    stationId: varchar('stationId', { length: 255 }),
  }
})

export type UserStaions = typeof userStaions