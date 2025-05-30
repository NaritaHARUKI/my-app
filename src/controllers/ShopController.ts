import { statusUpdate } from "../schema/Status.js"
import { shopGetShops, shopInsertShops, shopInsertShopStations, shops, shopUpdateShop, shopValidateUser } from "../schema/Shop.js"
import STATION_DATA from "../station-data.js"
import type { RouteResult } from "../routes/route.js"
import { register } from "module"

export const SHOP_STATUS = {
    INITIALIZE: 'initialize',
    REGISTER_NAME: 'register_name',
    REGISTER_ADDRESS: 'register_address',
    REGISTER_URL: 'register_url',
    SEARCH_STATION: 'search_station',
    REGISTER_STATION: 'register_station',
    REGISTER_DESCRIPTION: 'register_description',
    COMPLETE: 'complete',
    SHOW: 'show',
    EDIT: 'edit',
    REGISTER_EDIT: 'register_edit',
}

const ShopController = async (message: string, lineId: string, currentStatus: string, id?: number):Promise<RouteResult> => {
    const actions: Record<string, () => Promise<RouteResult>> = {
        initialize: async () => {
            statusUpdate(lineId, { shop_status: SHOP_STATUS.REGISTER_NAME })

            return { type: 'text', text: 'お店の名前を登録します。名前を入力してください。' }
        },
        register_name: async () => {
            const newShopId = await shopInsertShops(lineId, { name: message })
            if (!newShopId) return { type: 'text', text: 'お店の登録に失敗しました。' }

            await statusUpdate(lineId, { shop_status: `${SHOP_STATUS.REGISTER_ADDRESS}@${newShopId}` })

            return { type: 'text', text: `お店の名前「${message}」を登録しました。次にお店の住所を登録します。住所を入力してください。` }
        },
        register_address: async () => {
            if (!currentStatus) return { type: 'text', text: 'お店の情報が見つかりませんでした。' }
            
            const shopId = id || 0
            await shopUpdateShop(shopId,{ address: message })

            await statusUpdate(lineId, { shop_status: `${SHOP_STATUS.REGISTER_URL}@${shopId}` })

            return { type: 'text', text: `お店の住所「${message}」を登録しました。次にお店のURLを登録します。URLを入力してください。ない場合は「なし」と入力してください。` }
        },
        register_url: async () => {
            if (!currentStatus) return { type: 'text', text: 'お店の情報が見つかりませんでした。' }
            const shopId = id || 0
            await shopUpdateShop(shopId, { url: message })
            await statusUpdate(lineId, { shop_status: `${SHOP_STATUS.SEARCH_STATION}@${shopId}` })

            return { type: 'text', text: `お店のURL「${message}」を登録しました。次にお店の最寄り駅を登録します。登録したい最寄駅を入力してください。複数選択したい場合は改行して送信して下さい。\n例）\n名古屋\n栄` }
        },
        search_station: async () => {
            const submittedStations = message.split('\n').map(s => s.trim()).filter(s => s !== '')
            const uniqueStations = [...new Set(submittedStations)]
            const findStation = STATION_DATA.filter((station) => {
                return uniqueStations.some((uniqueStation) => {
                    return station.station_name.includes(uniqueStation) || station.station_name_kana.includes(uniqueStation)
                })
            })

            if (findStation.length === 0) return { type: 'text', text: '最寄駅の情報が見つかりませんでした。もう一度入力してください。' }
    
            await statusUpdate(lineId, { shop_status: `${SHOP_STATUS.REGISTER_STATION}@${id}` })

            return {
                type: 'text',
                text: `
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
            }
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
                return { type: 'text', text: `
以下の駅名は登録できませんでした。
もう一度入力してください。
-----------------------
${result.data.map((station) => `駅名またはid：${station}`).join('\n')}
-----------------------
                ` }
            }

            const shopId = id || 0
            if (!shopId) return { type: 'text', text: 'お店の情報が見つかりませんでした。' }
            const stationIds = result.data as number[]

            await shopInsertShopStations(shopId, stationIds)
            await statusUpdate(lineId, { shop_status: SHOP_STATUS.REGISTER_DESCRIPTION })

            return { type: 'text', text: `
お店の最寄駅を以下で登録しました。
-----------------------
駅名：${(result.data as number[]).map(_getStationName).join(',')}
-----------------------
            ` }
        },
        register_description: async () => {
            const shopId = id || 0
            if (!shopId) return { type: 'text', text: 'お店の情報が見つかりませんでした。' }
            await shopUpdateShop(shopId, { description: message })
            await statusUpdate(lineId, { shop_status: SHOP_STATUS.COMPLETE })

            return { type: 'text', text: `
お店の説明「${message}」を登録しました。
お店の登録が完了しました。
お店の情報は、「お店を確認する」で確認できます。
` }
        },
        show: async () => {
            const shops = await shopGetShops(lineId)
        
            if (shops.length === 0) return { type: 'text', text: '登録されているお店はまだありません。' }

            const text = shops.map((shop) => {
                const shopData = shop.shop
                return `
-----------------------
店名：${shopData.name}
住所：${shopData.address ?? '未登録'}
URL：${shopData.url ?? '未登録'}
説明：${shopData.description ?? '未登録'}
最寄駅：${shop.shop_stations.map((station) => {
                    const stationId = station.station_id
                    const found = STATION_DATA.find(st => st.id === stationId)
                    return found?.station_name
                }
                ).join(', ')}
-----------------------
                `
            })
            return { type: 'text', text: text.join('\n') }
        },
        edit: async () => {
            const shops = await shopGetShops(lineId)
            if (!shops) return { type: 'text', text: 'お店の情報が見つかりませんでした。' }
            await statusUpdate(lineId, { shop_status: SHOP_STATUS.REGISTER_EDIT })

            const text = shops.map((shop) => {
                const shopData = shop.shop
                return `
-----------------------
id：${shopData.id}
店名：${shopData.name}
住所：${shopData.address ?? '未登録'}
URL：${shopData.url ?? '未登録'}
説明：${shopData.description ?? '未登録'}
最寄駅：${shop.shop_stations.map((station) => {
                    const stationId = station.station_id
                    const found = STATION_DATA.find(st => st.id === stationId)
                    return found?.station_name
                }
                ).join(', ')}
-----------------------
                `
            }).join('\n') + `編集したいお店のid、項目名、編集後の値を入力してください。
例）
1
店名
新しい店名            
`

            return { type: 'text', text: text }
        },
        register_edit: async () => {
            const parts = message
                .split('\n')
                .map(s => s.trim())
                .filter(s => s !== '');
        
            if (parts.length < 3) {
                return {
                    type: 'text',
                    text: '形式が正しくありません。\n例:\n1\n店名\n新しい店名'
                };
            }
        
            const [shopIdRaw, item, value] = parts;
            const shopId = Number(shopIdRaw);

            const _validate = async () => {
                if (isNaN(shopId)) return { type: 'text', text: '1行目に有効なショップID（数字）を入力してください。' }
                if (!item || !value) return { type: 'text', text: '編集対象または値が不正です。' }
                await shopValidateUser(lineId, shopId) ?? { type: 'text', text: 'そのお店はあなたのものではありません。' } 
            }

            await _validate()
        
            // 編集対象に応じて更新
            if (item === '店名') {
                await shopUpdateShop(shopId, { name: value });
            } else if (item === '住所') {
                await shopUpdateShop(shopId, { address: value });
            } else if (item === 'URL') {
                await shopUpdateShop(shopId, { url: value });
            } else if (item === '説明') {
                await shopUpdateShop(shopId, { description: value });
            } else {
                return {
                    type: 'text',
                    text: `「${item}」は編集できる項目ではありません。`
                };
            }
        
            // ステータスを完了に更新
            await statusUpdate(lineId, { shop_status: SHOP_STATUS.COMPLETE });
        
            return {
                type: 'text',
                text: `お店（ID: ${shopId}）の${item}を「${value}」に変更しました。`
            };
        }
        

    }
    return await actions[currentStatus as keyof typeof actions]()
}

export default ShopController
