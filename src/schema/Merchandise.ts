import { boolean } from 'drizzle-orm/mysql-core'
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core'
import { DB } from '../db.ts'
import { desc, eq } from 'drizzle-orm'

export const merchandises = mysqlTable('merchandises', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    lineId: varchar('lineId', { length: 255 }),
    shopId: int('shopId'),
    name: varchar('name', { length: 255 }),
    imgPath: varchar('img_path', { length: 255 }),
    price: int('price'),
    stock: int('stock'),
    description: varchar('description', { length: 255 }),
    isLocked: boolean('is_locked').default(false),
    flexMessage: varchar('flex_message', { length: 255 }),
  }
})

export type Merchandises = typeof merchandises

/**
 * カラムに値を入れる
 */
export const insertMerchandise = async (
  lineId: string,
  shopId: number,
  message: string
): Promise<void> => {
  if (!lineId || !shopId || !message) return

  DB.insert(merchandises)
    .values({
        lineId: lineId,
        shopId: shopId,
        name: message,
    })
    .execute()
}

/**
 *  レコードを更新する
 */
export const updateMerchandise = async (lineId: string, value: Partial<typeof merchandises.$inferInsert>) => {
  const latest = await DB
    .select({ id: merchandises.id })
    .from(merchandises)
    .where(eq(merchandises.lineId, lineId))
    .orderBy(desc(merchandises.id))
    .limit(1)
    .execute()

  if (latest.length === 0) {
    console.error('No merchandise found for the given lineId')
    return
  }

  if (latest.length > 0) {
    await DB
      .update(merchandises)
      .set(value)
      .where(eq(merchandises.id, latest[0].id))
      .execute()
  }
}