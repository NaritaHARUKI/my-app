// ShopUsers.ts
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { shops } from './Shop.ts'

export const shopUsers = mysqlTable('shop_users', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    shop_id: int('shop_id').notNull().references(() => shops.id),
    line_id: varchar('line_id', { length: 255 }),
  }
})

export const shopUserRelations = relations(shopUsers, ({ one }) => ({
  shop: one(shops, {
    fields: [shopUsers.shop_id],
    references: [shops.id],
  }),
}))

export type ShopUsers = typeof shopUsers
