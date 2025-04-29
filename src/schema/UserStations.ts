import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const userStaions = mysqlTable('users_stations', (table) => {
  return {
    lineId: varchar('lineId', { length: 255 }),
    stationId: int('stationId').notNull(),
  }
})

export type UserStaions = typeof userStaions