import { eq } from "drizzle-orm";
import { status } from "../schema/Status.js";
import { DB } from "../db.js";
import { users } from "../schema/User.js";
import ShopController, { SHOP_STATUS } from "../controllers/ShopController.js";

type Status = {
    lineId: string;
    shopStatus: string;
    merchandiseStatus: string;
}

const routes = async (message: string, lineId: string): Promise<string> => {

    switch (message) {
        case 'お店を登録する':
            return await ShopController(message, lineId, SHOP_STATUS.INITIALIZE)
        case 'お店を確認する':
            return 'Goodbye! Have a great day!'
        case '商品を登録する':
            return 'Hello! How can I help you today?'
    }
    
    const currentStatus = await checkStatus(lineId)
    return await ShopController(message, lineId, currentStatus.shopStatus)
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