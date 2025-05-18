import { eq } from "drizzle-orm";
import { status } from "../schema/Status.js";
import { DB } from "../db.js";
import { users } from "../schema/User.js";
import UserController, { USER_STATUS } from "../controllers/UserController.js";
import { userStations } from "../schema/UserStations.ts";

export type RouteResult =
  | { type: 'text'; text: string }
  | { type: 'flex'; altText: string; contents: any }

export type RouteResults = RouteResult[]

type Status = {
    line_id: string;
    shop_status: string;
    merchandise_status: string;
    user_status: string;
    initialize?: boolean;
}

const routes = async (message: string, lineId: string): Promise<RouteResult | RouteResults> => {

    switch (message) {
        case '駅を確認する':
            return await UserController(message, lineId, USER_STATUS.CONFIRM)
        case '駅を更新する':
            return await UserController(message, lineId, USER_STATUS.REGISTER_STATION)
        // case 'お店を登録する':
        //     return await ShopController(message, lineId, SHOP_STATUS.INITIALIZE)
        // case 'お店を確認する':
        //     return await ShopController(message, lineId, SHOP_STATUS.SHOW)
        // case '商品を登録する':
        //     return await MerchandiseController(message, lineId, MERCHANDISE_STATUS.INITIALIZE)
    }
    
    const currentStatus = await checkStatus(lineId)

    if(currentStatus.initialize) {
        return await UserController(message, lineId, USER_STATUS.INITIALIZE)
    }

    if (currentStatus.user_status !== '') {
        return await UserController(message, lineId, currentStatus.user_status)
    }

    // if (currentStatus.shopStatus !== SHOP_STATUS.COMPLETE) {
    //     return await ShopController(message, lineId, currentStatus.shopStatus)
    // }

    // if (currentStatus.shopStatus === SHOP_STATUS.COMPLETE && currentStatus.merchandiseStatus !== MERCHANDISE_STATUS.COMPLETE) {
    //     return await MerchandiseController(message, lineId, currentStatus.merchandiseStatus)
    // }

    console.log('currentStatus', currentStatus)

    return { type: 'text', text: 'ニコニコ☺️' }
}

export default routes

const checkStatus = async (lineId: string): Promise<Status> => {
    const currentStatus = await DB
        .select()
        .from(status)
        .where(eq(status.line_id, lineId))
        .limit(1)
        .execute()

    const userStation = await DB
        .select({
            user: users,
            stations: userStations,
          })
        .from(users)
        .leftJoin(userStations, eq(users.line_Id, userStations.line_Id))
        .where(eq(users.line_Id, lineId))
        .limit(1)
        .execute() ?? []
    
    console.log('userStation', userStation)

    const initialUser = currentStatus.length === 0 || !userStation[0]?.stations

    // 完全新規ユーザーの場合、UsersテーブルにとStatusレコードを追加
    if (currentStatus.length === 0) {
        await DB.insert(users).values({
            line_Id: lineId,
        })
        .execute()
        
        await DB.insert(status).values({
            line_id: lineId,
            shop_status: '',
            merchandise_status: '',
        }).execute()
    }

    // ユーザーが初期状態(=最寄駅の登録が一件もない)の場合
    if(initialUser) {
        return {
            line_id: lineId,
            shop_status: '',
            merchandise_status: '',
            user_status: USER_STATUS.INITIALIZE,
            initialize: true,
        }
    }

    return {
        ...currentStatus[0],
        initialize: false,
    } as Status
}