import { mysqlTable, varchar, int, primaryKey } from 'drizzle-orm/mysql-core'
import { users } from './User.js'

export const userStations = mysqlTable('user_stations', (table) => {
    return {
      lineId: varchar('lineId', { length: 255 }).notNull().references(() => users.lineId),
      stationId: int('stationId').notNull(),
    }
  }, (table) => ({
    pk: primaryKey({ columns: [table.lineId, table.stationId] }),
  }))
  
export type UserStations = typeof userStations