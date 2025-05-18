import STATION_DATA from "../station-data.js"
import type { RouteResult, RouteResults } from "../routes/route.js"
import { statusUpdate } from "../schema/Status.ts"
import { userInsertUserStaions, usersGetUser } from "../schema/User.ts"
import getStationName from "./hooks/getStaionName.ts"

export const USER_STATUS = {
    INITIALIZE: 'initialize',
    SEARCH_STATION: 'search_station',
    REGISTER_STATION: 'register_station',
    COMPLETE: 'complete',
    CONFIRM: 'confirm',
}

const UserController = async (message: string, lineId: string, currentStatus: string): Promise<RouteResults | RouteResult> => {
    const actions: Record<string, () => Promise<RouteResults | RouteResult>> = {
        initialize: async () => {
            await statusUpdate(lineId, { user_status: USER_STATUS.SEARCH_STATION })

            return { type: 'text', text: '利用登録を開始します！受け取りたい駅名を送信してください！\n例）\n名古屋\n栄' }
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
    
            await statusUpdate(lineId, { user_status: USER_STATUS.REGISTER_STATION })

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

            const stationIds = result.data as number[]
            await statusUpdate(lineId, { user_status: USER_STATUS.COMPLETE })
            await userInsertUserStaions(lineId, stationIds)

            return { type: 'text', text: `
あなたの最寄駅を以下で登録しました。
-----------------------
駅名：${(result.data as number[]).map(_getStationName).join(',')}
-----------------------
商品情報をお待ちください！
            ` }
        },
        confirm: async () => {
            const user = await usersGetUser(lineId)
            if (!user) return { type: 'text', text: 'ユーザー情報が見つかりませんでした。' }

            const text = `
            あなたの登録情報は以下の通りです。
            -----------------------
            最寄駅：${Array.isArray(user.stations) ? user.stations.map(stationId => getStationName(stationId)).join(',') : ''}`
            return { type: 'text', text: text }
        }
       
    }

    console.log(`[UserController] lineId: ${lineId}, currentStatus: ${currentStatus}, message: ${message}`)
    return await actions[currentStatus as keyof typeof actions]()
}

export default UserController
