// UserStations.ts
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { users } from './User.ts'

export const userStations = mysqlTable('users_stations', (table) => {
  return {
    line_Id: varchar('line_id', { length: 255 }).notNull().references(() => users.line_Id),
    station_id: int('station_id').notNull(),
  }
}, (table) => ({
  pk: [table.line_Id, table.station_id],
}))

export const userStationRelations = relations(userStations, ({ one }) => ({
  user: one(users, {
    fields: [userStations.line_Id],
    references: [users.line_Id],
  }),
}))

export type UserStations = typeof userStations
