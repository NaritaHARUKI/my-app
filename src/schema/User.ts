// User.ts
import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { userStations } from './UserStations.ts'

export const users = mysqlTable('users', (table) => {
  return {
    line_Id: varchar('line_id', { length: 255 }).primaryKey(),
  }
})

export const userRelations = relations(users, ({ many }) => ({
  stations: many(userStations),
}))

export type Users = typeof users
