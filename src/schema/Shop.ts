// Shop.ts
import { eq, relations, type InferModel } from 'drizzle-orm'
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { shopStations, type ShopStation } from './ShopStations.ts'
import { shopUsers } from './ShopUsers.ts'
import { DB } from '../db.ts'

export const shops = mysqlTable('shops', (table) => {
  return {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 255 }),
    address: varchar('address', { length: 255 }),
    url: varchar('url', { length: 255 }),
    description: varchar('description', { length: 255 }),
    station_id: int('station_id'),
  }
})

export const shopRelations = relations(shops, ({ many }) => ({
  shopStations: many(shopStations),
  shopUsers: many(shopUsers),
}))

export type Shop = InferModel<typeof shops>

const shopInsertShops = async (lineId: string, value: {
  [key: string]: string
}): Promise<number> => {

  const newShopResult = await DB.insert(shops)
      .values(value)
      .execute()

  const newShopId = newShopResult[0].insertId

  await DB.insert(shopUsers)
  .values({
    line_id: lineId,
    shop_id: newShopId,
  })
  .execute()

  return newShopId
}

const shopUpdateShop = async (
  shopId: number, 
  value: {
  [key: string]: string
}): Promise<void> => {
  await DB.update(shops)
    .set(value)
    .where(eq(shops.id, shopId))
    .execute()
}

const shopInsertShopStations = async (shopId: number, stationIds: number[]): Promise<void> => {
  await Promise.all(stationIds.map(async (stationId) => {
    await DB.insert(shopStations)
      .values({
        shop_id: shopId,
        station_id: stationId,
      })
      .execute()
  }))
}

export const shopGetShops = async (lineId: string): Promise<{
  shop: Shop,
  shop_stations: ShopStation[]
}[]> => {
  const rows = await DB
    .select({
      shop: shops,
      shop_station: shopStations,
    })
    .from(shopUsers)
    .where(eq(shopUsers.line_id, lineId))
    .innerJoin(shops, eq(shopUsers.shop_id, shops.id))
    .innerJoin(shopStations, eq(shopUsers.shop_id, shopStations.shop_id))
    .execute()

  // 店舗IDでグルーピング
  const grouped = new Map<number, { shop: Shop, shop_stations: ShopStation[] }>()
  for (const row of rows) {
    const existing = grouped.get(row.shop.id)
    if (existing) {
      existing.shop_stations.push(row.shop_station)
    } else {
      grouped.set(row.shop.id, {
        shop: row.shop,
        shop_stations: [row.shop_station],
      })
    }
  }

  return Array.from(grouped.values())
}

export const shopValidateUser = async (lineId: string,shopId: number): Promise<boolean> => {
  const editableShopIds = await DB
    .select()
    .from(shopUsers)
    .where(eq(shopUsers.line_id, lineId))
    .limit(1)
    .execute()

  const result = editableShopIds.filter((shop) => shop.shop_id === shopId)

  return result.length > 0
}

export {
  shopInsertShops,
  shopUpdateShop,
  shopInsertShopStations
}
