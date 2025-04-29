

import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { DB } from '../db.ts'
import { userStaions } from './UserStations.ts'
import { inArray } from 'drizzle-orm'

export const users = mysqlTable('users', (table) => {
  return {
    lineId: varchar('lineId', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }),
    type: varchar('type', { length: 255 }),
  }
})

export type Users = typeof users

/**
 * ユーザーを登録する
 */
export const insertUser = async (
  lineId: string,
  stationIds: number[]
): Promise<void> => {
  if (!lineId || !stationIds) return

  await DB.insert(users).values({
    lineId: lineId,
    name: '',
    type: '',
  }).execute()

  await DB.insert(userStaions).values(
    stationIds.map((stationId) => ({
      lineId: lineId,
      stationId: stationId,
    }))
  ).execute()
}

/**
 * Stationが一致するユーザーのLineIDを取得する
 */
export const getUserLineIdByStationId = async (
  stationIds: number[]
): Promise<string[] | null> => {
  if (!stationIds) return null

  const targetUsers = await DB.select()
    .from(userStaions)
    .where(inArray(userStaions.stationId, stationIds))
    .execute()

  const lineIds = targetUsers.map((record) => record.lineId)
  return lineIds || null
}