import { shop } from '@line/bot-sdk'
import { boolean } from 'drizzle-orm/mysql-core'
import { mysqlTable, varchar, int } from 'drizzle-orm/mysql-core'

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
  }
})

export type Merchandises = typeof merchandises