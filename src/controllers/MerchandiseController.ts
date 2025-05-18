import { desc, eq } from "drizzle-orm"
import { DB } from "../db.js"
import { updateStatus } from "../schema/Status.js"
import { insertMerchandise, merchandises, updateMerchandise } from "../schema/Merchandise.js"
import { getShopByLineId, getShopStationIdsByLineId, shops } from "../schema/Shop.js"
import { shopStations } from "../schema/ShopStations.js"
import STATION_DATA from "../station-data.js"
import type { RouteResult, RouteResults } from "../routes/route.js"
import * as line from '@line/bot-sdk'

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
            await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.REGISTER_NAME })

            return { type: 'text', text: '商品名を登録します。商品名を入力してください。' }
        },
        register_name: async (): Promise<RouteResult> => {
            const shopId = await getShopByLineId(lineId)
            if(!shopId) return { type: 'text', text: '店舗情報が見つかりませんでした。' }

            await insertMerchandise(lineId, shopId, message)
            await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.REGISTER_PRICE })

            return { type: 'text', text: `商品名「${message}」を登録しました。次に価格を登録します。価格（数字のみ）を入力してください。` }
        },
        register_price: async (): Promise<RouteResult> => {
            const price = Number(message)
            if (isNaN(price)) return { type: 'text', text: '価格は数字で入力してください。' }

            await updateMerchandise(lineId, { price })
            await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.REGISTER_STOCK })

            return { type: 'text', text: `価格「¥${price}」を登録しました。次に在庫数を入力してください。` }
        },
        register_stock: async (): Promise<RouteResult> => {
            const stock = Number(message)
            if (isNaN(stock)) return { type: 'text', text: '在庫数は数字で入力してください。' }

            await updateMerchandise(lineId, { stock })
            await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.REGISTER_IMAGE })

            return { type: 'text', text: `在庫数「${stock}個」を登録しました。次に商品の画像パス(URL)を入力してください。` }
        },
        register_image: async (): Promise<RouteResults> => {
            await updateMerchandise(lineId, { imgPath: message })
            await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.CONFIRM_SEND })

            const flexMessage = await createMerchandiseFlexMessage(lineId)

            return [
                { type: 'flex', altText: '新しい商品が登録されました！', contents: flexMessage },
                { type: 'text', text: 'この内容で送信してもよろしいですか？「はい」または「いいえ」でお答えください。' }
            ]
        },
        confirm_send: async (): Promise<RouteResult> => {
            if (message.toLowerCase() === 'はい') {
                await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.COMPLETE })
               
                // 商品を登録
                const flexMessage = await createMerchandiseFlexMessage(lineId)
                await updateMerchandise(lineId, { flexMessage: JSON.stringify(flexMessage) })
                
                // 送信対象のユーザーを取得
                const stationIds = await getShopStationIdsByLineId(lineId)
                if (!stationIds) return { type: 'text', text: '店舗情報が見つかりませんでした。' }

                // const userIds = await getUserLineIdByStationId(stationIds)
                // if (!userIds) return { type: 'text', text: 'ユーザー情報が見つかりませんでした。' }

                // await pushMessage(userIds, flexMessage)
                
                return { type: 'text', text: '商品情報を送信しました📦✨' }
            } else if (message.toLowerCase() === 'いいえ') {
                await updateStatus(lineId, { merchandiseStatus: MERCHANDISE_STATUS.INITIALIZE })

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

const getMessageContent  = async(messageId: string): Promise<Buffer | null> => {
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

const pushMessage = async (userIds: string[], flexMessage: any): Promise<void> => {
    const config: line.ClientConfig = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!
    }
    const client = new line.messagingApi.MessagingApiClient(config)

    try {
        await client.multicast({
            to: userIds,
            messages: [
                { 
                    type: 'text',
                    text: '登録された駅情報をもとに、商品情報をお届けします！',
                }, 
                flexMessage
            ]
        })
    } catch (err) {
        console.error('Multicast送信エラー:', err)
    }
}