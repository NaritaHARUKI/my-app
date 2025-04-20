import { eq } from "drizzle-orm"
import { DB } from "../db.js"
import { status } from "../schema/Status.js"
import { shops } from "../schema/Shop.js"
import STATION_DATA from "../station-data.js"
import { shopStaions } from "../schema/ShopStations.js"

export const SHOP_STATUS = {
    INITIALIZE: 'initialize',
    REGISTER_NAME: 'register_name',
    REGISTER_ADDRESS: 'register_address',
    REGISTER_URL: 'register_url',
    SEARCH_STATION: 'search_station',
    REGISTER_STATION: 'register_station',
    COMPLETE: 'complete',
}

const ShopController = async (message: string, lineId: string, currentStatus: string):Promise<string> => {
    const actions = {
        initialize: async () => {
            await DB.update(status)
                .set({ shopStatus: SHOP_STATUS.REGISTER_NAME })
                .where(eq(status.lineId, lineId))
                .execute()

            return 'お店の名前を登録します。名前を入力してください。'
        },
        register_name: async () => {
            await DB.insert(shops)
                .values({
                    lineId: lineId,
                    name: message,
                })
                .execute()

            await DB.update(status)
                .set({ shopStatus: SHOP_STATUS.REGISTER_ADDRESS })
                .where(eq(status.lineId, lineId))
                .execute()

            return `お店の名前「${message}」を登録しました。次にお店の住所を登録します。住所を入力してください。`
        },

        register_address: async () => {
            await DB.update(shops)
                .set({ address: message })
                .where(eq(shops.lineId, lineId))
                .execute()

            await DB.update(status)
                .set({ shopStatus: SHOP_STATUS.REGISTER_URL })
                .where(eq(status.lineId, lineId))
                .execute()

            return `お店の住所「${message}」を登録しました。次にお店のURLを登録します。URLを入力してください。ない場合は「なし」と入力してください。`
        },
        register_url: async () => {
            await DB.update(shops)
                .set({ url: message })
                .where(eq(shops.lineId, lineId))
                .execute()

            await DB.update(status)
                .set({ shopStatus: SHOP_STATUS.SEARCH_STATION})
                .where(eq(status.lineId, lineId))
                .execute()

            return `お店のURL「${message}」を登録しました。次にお店の最寄り駅を登録します。登録したい最寄駅を入力してください。複数選択したい場合は改行して送信して下さい。
例）
名古屋
栄`
        },
        search_station: async () => {
            const submittedStations = message.split('\n').map(s => s.trim()).filter(s => s !== '')
            const uniqueStations = [...new Set(submittedStations)]
            const findStation = STATION_DATA.filter((station) => {
                return uniqueStations.some((uniqueStation) => {
                    return station.station_name.includes(uniqueStation) || station.station_name_kana.includes(uniqueStation)
                })
            })

            if (findStation.length === 0) return `最寄駅の情報が見つかりませんでした。もう一度入力してください。`
    

            await DB.update(status)
                .set({ shopStatus: SHOP_STATUS.REGISTER_STATION })
                .where(eq(status.lineId, lineId))
                .execute()
    return `
${findStation.length}件の駅が見つかりました。
-----------------------
${findStation.map((station) => {
    return `
    id：${station.id}
    駅名：${station.station_name}
    路線名：${station.line_name}
    都道府県名：${station.prefecture}
    `
}).join('\n')}
-----------------------
上記の中から、登録したい最寄駅の駅名、またはidを送信してください。複数選択したい場合は改行して送信して下さい。
例）
名古屋
栄

または
1
2
`
        },
        register_station: async () => {
            const _validate = (message: string) => {
                let errs: string[] = []
                let ok: number[] = []
                const submittedStations = message.split('\n').map(s => s.trim()).filter(s => s !== '')
                const uniqueStations = [...new Set(submittedStations)]

                uniqueStations.forEach((uniqueStation) => {
                    const found = STATION_DATA.some((station) =>
                        station.station_name === uniqueStation || station.id === Number(uniqueStation)
                    )

                    if (found) {
                        const stationId = STATION_DATA.find(
                            station => station.station_name === uniqueStation || station.id === Number(uniqueStation)
                        )?.id
                        if (stationId) ok.push(stationId)
                    } else {
                        errs.push(uniqueStation)
                    }
                })

                if (errs.length > 0) {
                    return { ok: false, data: errs }
                }
                return { ok: true, data: ok }
            }

            const _getStationName = (stationId: number) => {
                const station = STATION_DATA.find(station => station.id === stationId)
                return station?.station_name
            }

            const result = _validate(message)

            if (!result.ok) {
                return `
以下の駅名は登録できませんでした。
もう一度入力してください。
-----------------------
${result.data.map((station) => `駅名またはid：${station}`).join('\n')}
-----------------------
                `
            }

            const shopId = (await DB.select().from(shops).where(eq(shops.lineId, lineId)).limit(1).execute())[0].id
            if (!shopId) return 'お店の情報が見つかりませんでした。'
            const stationIds = _validate(message).data as number[]
            await Promise.all(stationIds.map(async (stationId) => {
                await DB.insert(shopStaions)
                    .values({
                        shopId,
                        stationId: stationId,
                    })
                    .execute()
            }))

            await DB.update(status)
                .set({ shopStatus: SHOP_STATUS.COMPLETE })
                .where(eq(status.lineId, lineId))
                .execute()

            return `
お店の最寄駅を以下で登録しました。
-----------------------
駅名：${(result.data as number[]).map(_getStationName).join(',')}
-----------------------
お店の登録が完了しました。
お店の情報は、「お店の情報を確認する」で確認できます。
            `
        }
    }

    console.log(`[ShopController] lineId: ${lineId}, currentStatus: ${currentStatus}, message: ${message}`)
    return await actions[currentStatus as keyof typeof actions]()
}

export default ShopController
