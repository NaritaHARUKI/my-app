import { boolean } from 'drizzle-orm/mysql-core'
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core'

export const merchandises = mysqlTable('merchandises', (table) => {
  return {
    id: varchar('id', { length: 255 }).primaryKey(),
    lineId: varchar('lineId', { length: 255 }),
    name: varchar('name', { length: 255 }),
    img_path: varchar('img_path', { length: 255 }),
    price: int('price'),
    stock: int('stock'),
    description: varchar('description', { length: 255 }),
    is_locked: boolean('is_locked').default(false),
  }
})

export type Merchandises = typeof merchandises