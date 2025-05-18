// Merchandise.ts
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { merchandiseItems } from './MerchandiseItems.ts'

export const merchandises = mysqlTable('merchandises', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    shop_id: int('shopId'),
    price: int('price'),
    last_receive_date: varchar('last_receive_date', { length: 255 }),
    img_path: varchar('img_path', { length: 255 }),
    notification_json: varchar('notification_json', { length: 255 }),
  }
})

export const merchandiseRelations = relations(merchandises, ({ many }) => ({
  items: many(merchandiseItems),
}))

export type Merchandises = typeof merchandises
