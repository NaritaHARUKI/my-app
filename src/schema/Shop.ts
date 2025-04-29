
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { DB } from '../db.ts'
import { eq } from 'drizzle-orm'
import { shopStations } from './ShopStations.ts'

export const shops = mysqlTable('shops', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    lineId: varchar('lineId', { length: 255 }),
    name: varchar('name', { length: 255 }),
    address: varchar('address', { length: 255 }),
    url: varchar('url', { length: 255 }),
  }
})

export type Shops = typeof shops

/**
 * shopIdを取得する
 */
export const getShopByLineId = async (
  lineId: string
): Promise<number | null> => {
  if (!lineId) return null

  const shopId = await DB.select().from(shops).where(eq(shops.lineId, lineId)).limit(1).execute()

  return Number(shopId[0]?.id) || null
}

/**
 * 対象のLineIdに紐ずくShopに紐ずくStation IDを取得する
 */
export const getShopStationIdsByLineId = async (
  lineId: string,
): Promise<number[] | null> => {
  if (!lineId) return null

  const stationIdRecords = await DB
      .select({ stationId: shopStations.stationId })
      .from(shops)
      .innerJoin(shopStations, eq(shops.id, shopStations.shopId))
      .where(eq(shops.lineId, lineId))
      .execute()

  const stationIds = stationIdRecords.map(record => record.stationId)

  return  stationIds || null
}