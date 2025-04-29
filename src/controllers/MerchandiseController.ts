import { desc, eq, inArray } from "drizzle-orm"
import { DB } from "../db.js"
import { status } from "../schema/Status.js"
import { merchandises } from "../schema/Merchandise.js"
import { shops } from "../schema/Shop.js"
import { shopStations } from "../schema/ShopStations.js"
import STATION_DATA from "../station-data.js"
import type { RouteResult, RouteResults } from "../routes/route.js"
import { use } from "hono/jsx"
import { userStaions } from "../schema/UserStations.js"

export const MERCHANDISE_STATUS = {
    INITIALIZE: 'initialize',
    REGISTER_NAME: 'register_name',
    REGISTER_PRICE: 'register_price',
    REGISTER_STOCK: 'register_stock',
    REGISTER_IMAGE: 'register_image',
    COMPLETE: 'complete',
    CONFIRM_SEND: 'confirm_send',
}

const MerchandiseController = async (message: string, lineId: string, currentStatus: string): Promise<RouteResults | RouteResult> => {
    const actions = {
        initialize: async (): Promise<RouteResult > => {
            await DB.update(status)
                .set({ merchandiseStatus: MERCHANDISE_STATUS.REGISTER_NAME })
                .where(eq(status.lineId, lineId))
                .execute()

            return { type: 'text', text: '商品名を登録します。商品名を入力してください。' }
        },
        register_name: async (): Promise<RouteResult> => {
            const shopId = await DB.select().from(shops).where(eq(shops.lineId, lineId)).limit(1).execute()
            await DB.insert(merchandises)
                .values({
                    lineId: lineId,
                    shopId: shopId[0].id,
                    name: message,
                })
                .execute()

            await DB.update(status)
                .set({ merchandiseStatus: MERCHANDISE_STATUS.REGISTER_PRICE })
                .where(eq(status.lineId, lineId))
                .execute()

            return { type: 'text', text: `商品名「${message}」を登録しました。次に価格を登録します。価格（数字のみ）を入力してください。` }
        },
        register_price: async (): Promise<RouteResult> => {
            const price = Number(message)
            if (isNaN(price)) return { type: 'text', text: '価格は数字で入力してください。' }

            await DB.update(merchandises)
                .set({ price })
                .where(eq(merchandises.lineId, lineId))
                .execute()

            await DB.update(status)
                .set({ merchandiseStatus: MERCHANDISE_STATUS.REGISTER_STOCK })
                .where(eq(status.lineId, lineId))
                .execute()

            return { type: 'text', text: `価格「¥${price}」を登録しました。次に在庫数を入力してください。` }
        },
        register_stock: async (): Promise<RouteResult> => {
            const stock = Number(message)
            if (isNaN(stock)) return { type: 'text', text: '在庫数は数字で入力してください。' }

            await DB.update(merchandises)
                .set({ stock })
                .where(eq(merchandises.lineId, lineId))
                .execute()

            await DB.update(status)
                .set({ merchandiseStatus: MERCHANDISE_STATUS.REGISTER_IMAGE })
                .where(eq(status.lineId, lineId))
                .execute()

            return { type: 'text', text: `在庫数「${stock}個」を登録しました。次に商品の画像パス(URL)を入力してください。` }
        },
        register_image: async (): Promise<RouteResults> => {
            await DB.update(merchandises)
                .set({ imgPath: message })
                .where(eq(merchandises.lineId, lineId))
                .execute()

            await DB.update(status)
                .set({ merchandiseStatus: MERCHANDISE_STATUS.CONFIRM_SEND })
                .where(eq(status.lineId, lineId))
                .execute()
            
            const flexMessage = await createMerchandiseFlexMessage(lineId)

                return [
                    { type: 'flex', altText: '新しい商品が登録されました！', contents: flexMessage },
                    { type: 'text', text: 'この内容で送信してもよろしいですか？「はい」または「いいえ」でお答えください。' }
                ]
        },
        confirm_send: async (): Promise<RouteResult> => {
            if (message.toLowerCase() === 'はい') {
                await DB.update(status)
                    .set({ merchandiseStatus: MERCHANDISE_STATUS.COMPLETE })
                    .where(eq(status.lineId, lineId))
                    .execute()
               
                // 商品を登録
                const flexMessage = await createMerchandiseFlexMessage(lineId)
                await DB.update(merchandises).set({ flexMessage: JSON.stringify(flexMessage) })
                
                // 送信対象のユーザーを取得
                const stationResult = await DB
                    .select({ stationId: shopStations.stationId })
                    .from(shops)
                    .innerJoin(shopStations, eq(shops.id, shopStations.shopId))
                    .where(eq(shops.lineId, lineId))
                    .execute()

                const stationIds = stationResult.map(station => station.stationId)
                const userRecords = await DB.select().from(userStaions).where(inArray(userStaions.stationId, stationIds)).execute()
                const userIds = userRecords.map(record => record.lineId)

                console.log(userIds)
                // この後Push通知をする　

                return { type: 'text', text: '商品情報を送信しました📦✨' }
            } else if (message.toLowerCase() === 'いいえ') {
                await DB.update(status)
                    .set({ merchandiseStatus: MERCHANDISE_STATUS.INITIALIZE })
                    .where(eq(status.lineId, lineId))
                    .execute()

                return { type: 'text', text: '送信をキャンセルしました。再度登録を開始する場合は「商品登録開始」と入力してください。' }
            } else {
                return { type: 'text', text: '「はい」または「いいえ」で回答してください🙏' }
            }
        }
    }

    console.log(`[MerchandiseController] lineId: ${lineId}, currentStatus: ${currentStatus}, message: ${message}`)
    return await actions[currentStatus as keyof typeof actions]()
}

export default MerchandiseController

async function getMessageContent(messageId: string): Promise<Buffer | null> {
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`
    const accessToken = process.env.CHANNEL_ACCESS_TOKEN!

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })

        if (response.ok) {
            const buffer = await response.arrayBuffer()
            return Buffer.from(buffer)
        } else {
            console.error('Failed to retrieve content:', response.status)
            return null
        }
    } catch (error) {
        console.error('Error fetching content:', error)
        return null
    }
}


const createMerchandiseFlexMessage = async (lineId: string) => {
    const merchandise = await DB
      .select()
      .from(merchandises)
      .where(eq(merchandises.lineId, lineId))
      .orderBy(desc(merchandises.id))
      .limit(1)
      .execute()
    const image = await getMessageContent(merchandise[0].imgPath!)
    const shopData = await DB.select().from(shops).where(eq(shops.lineId, lineId)).limit(1).execute()
    const stationData = await DB.select().from(shopStations).where(eq(shopStations.shopId, shopData[0].id)).execute()

    if (merchandise.length === 0 || shopData.length === 0) {
        throw new Error("商品または店舗情報が見つかりませんでした")
    }

    const flex = {
        type: "bubble",
        hero: {
            type: "image",
            url: image,
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
        },
        body: {
            type: "box",
            layout: "vertical",
            contents: [
                { type: "text", text: merchandise[0].name, weight: "bold", size: "lg", wrap: true },
                { type: "text", text: `価格: ¥${merchandise[0].price}`, size: "md", color: "#FF5551", margin: "md" },
                { type: "text", text: `在庫数: ${merchandise[0].stock}個`, size: "sm", margin: "md" },
                { type: "text", text: `お店名: ${shopData[0].name}`, size: "sm", margin: "md" },
                { type: "text", text: `最寄駅: ${stationData.map(s => STATION_DATA.find(st => st.id === s.stationId)?.station_name || '不明').join(', ')}`, size: "sm", margin: "md" }
            ]
        }
    }

    return flex
}
