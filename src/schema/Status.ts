import { eq } from 'drizzle-orm'
import { DB } from '../db.ts'
import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const status = mysqlTable('status', (table) => {
  return {
    lineId: varchar('lineId', { length: 255 }).primaryKey(),
    shopStatus: varchar('shop_status', { length: 255 }),
    merchandiseStatus: varchar('merchandise_status', { length: 255 }),
    userStatus: varchar('user_status', { length: 255 }),
  }
})

export type Status = typeof status

/**
 * ステータスを更新する
 */
export const updateStatus = async (
  lineId: string,
  updateFields: Partial<{
    [key: string]: string | null
  }>
): Promise<void> => {
  if (!lineId || Object.keys(updateFields).length === 0) return

  await DB
    .update(status)
    .set(updateFields)
    .where(eq(status.lineId, lineId))
    .execute()
}