import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { DB } from '../db.ts'
import { eq } from 'drizzle-orm'

export const status = mysqlTable('status', (table) => {
  return {
    line_id: varchar('line_id', { length: 255 }).primaryKey(),
    shop_status: varchar('shop_status', { length: 255 }),
    merchandise_status: varchar('merchandise_status', { length: 255 }),
    user_status: varchar('user_status', { length: 255 }),
  }
})

export type Status = typeof status

const statusUpdate = async (lineId: string, value: {
    [key: string]: string
}): Promise<void> => {
  if (Object.keys(value).length === 0) return
  
  await DB.update(status)
    .set(value)
    .where(eq(status.line_id, lineId))
    .execute()
}

export {
  statusUpdate
}