import { relations } from 'drizzle-orm';
import { shops } from './Shop.js';
import { shopStations } from './ShopStations.js';
export const shopRelations = relations(shops, ({ many }) => ({
    shopStations: many(shopStations),
}));
export const shopStationRelations = relations(shopStations, ({ one }) => ({
    shop: one(shops, {
        fields: [shopStations.shopId],
        references: [shops.id],
    }),
}));
