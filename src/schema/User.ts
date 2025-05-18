// User.ts
import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { and, eq, inArray, relations } from 'drizzle-orm'
import { userStations } from './UserStations.ts'
import { DB } from '../db.ts'

export const users = mysqlTable('users', (table) => {
  return {
    line_Id: varchar('line_id', { length: 255 }).primaryKey(),
  }
})

export const userRelations = relations(users, ({ many }) => ({
  stations: many(userStations),
}))

export type Users = typeof users

const usersGetUser = async (lineId: string): Promise<{
  line_Id: string
  stations: number[]
}> => {
  const userWithStations = await DB
    .select({
      user: users,
      station: userStations,
    })
    .from(users)
    .leftJoin(userStations, eq(users.line_Id, userStations.line_Id))
    .where(eq(users.line_Id, lineId))
    .execute()

  if (userWithStations.length === 0) return { line_Id: lineId, stations: [] }

  const { user } = userWithStations[0]
  const stations = userWithStations
    .filter((row) => row.station !== null)
    .map((row) => row.station!.station_id)

  return {
    ...user,
    stations,
  }
}

const userInsertUserStaions = async (lineId: string, stationIds: number[]): Promise<void> => {
  if (stationIds.length === 0) return

  // すでに登録されている駅を削除
  await DB.delete(userStations)
  .where(eq(userStations.line_Id, lineId))
    .execute()

  await DB.insert(userStations).values(
    stationIds.map((stationId) => ({
      line_Id: lineId,
      station_id: stationId,
    }))
  ).execute()
}

export {
  userInsertUserStaions,
  usersGetUser,
}