import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/schema/**/Merchandise.ts',
    './src/schema/**/Shop.ts',
    './src/schema/**/Status.ts',
    './src/schema/**/User.ts',
    './src/schema/**/UserStations.ts',
    './src/schema/**/ShopStations.ts',
  ],
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
