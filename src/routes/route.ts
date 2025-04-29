import { eq } from "drizzle-orm";
import { status } from "../schema/Status.js";
import { DB } from "../db.js";
import { users } from "../schema/User.js";
import ShopController, { SHOP_STATUS } from "../controllers/ShopController.js";
import MerchandiseController, { MERCHANDISE_STATUS } from "../controllers/MerchandiseController.js";
import UserController, { USER_STATUS } from "../controllers/UserController.js";

export type RouteResult =
  | { type: 'text'; text: string }
  | { type: 'flex'; altText: string; contents: any }

export type RouteResults = RouteResult[]

type Status = {
    lineId: string;
    shopStatus: string;
    merchandiseStatus: string;
}

const routes = async (message: string, lineId: string): Promise<RouteResult | RouteResults> => {

    switch (message) {
        case '利用登録':
            return await UserController(message, lineId, USER_STATUS.INITIALIZE)
        case 'お店を登録する':
            return await ShopController(message, lineId, SHOP_STATUS.INITIALIZE)
        case 'お店を確認する':
            return await ShopController(message, lineId, SHOP_STATUS.SHOW)
        case '商品を登録する':
            return await MerchandiseController(message, lineId, MERCHANDISE_STATUS.INITIALIZE)
    }
    
    const currentStatus = await checkStatus(lineId)

    if (currentStatus.shopStatus !== SHOP_STATUS.COMPLETE) {
        return await ShopController(message, lineId, currentStatus.shopStatus)
    }

    if (currentStatus.shopStatus === SHOP_STATUS.COMPLETE && currentStatus.merchandiseStatus !== MERCHANDISE_STATUS.COMPLETE) {
        return await MerchandiseController(message, lineId, currentStatus.merchandiseStatus)
    }

    return { type: 'text', text: 'ニコニコ☺️' }
}

export default routes

const checkStatus = async (lineId: string): Promise<Status> => {
    const currentStatus = await DB
        .select()
        .from(status)
        .where(eq(status.lineId, lineId))
        .limit(1)
        .execute()

    // 新規ユーザーの場合
    if (currentStatus.length === 0) {
        await DB.insert(users).values({
            lineId: lineId,
            name: '',
        }).execute()
        
        await DB.insert(status).values({
            lineId: lineId,
            shopStatus: '',
            merchandiseStatus: '',
        }).execute()

        return {
            lineId: lineId,
            shopStatus: '',
            merchandiseStatus: '',
        }
    }

    return currentStatus[0] as Status
}