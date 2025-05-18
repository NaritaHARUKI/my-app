// MerchandiseItem.ts
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core'
import { relations } from 'drizzle-orm'
import { merchandises } from './Merchandise.ts'

export const merchandiseItems = mysqlTable('merchandise_items', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    merchandise_id: int('merchandise_id').notNull().references(() => merchandises.id),
    bought_by: varchar('bought_by', { length: 255 }),
    status: varchar('status', { length: 255 }),
  }
})

export const merchandiseItemRelations = relations(merchandiseItems, ({ one }) => ({
  merchandise: one(merchandises, {
    fields: [merchandiseItems.merchandise_id],
    references: [merchandises.id],
  }),
}))

export type MerchandiseItems = typeof merchandiseItems
