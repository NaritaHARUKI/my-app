import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import * as line from '@line/bot-sdk';
import { getConnection } from './db.js';
import 'dotenv/config';
import routes from './routes/route.js';
const app = new Hono();
getConnection();
app.post('/webhook', async (c) => {
    const config = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
    };
    const client = new line.messagingApi.MessagingApiClient(config);
    line.middleware({ channelSecret: process.env.CHANNEL_SECRET });
    const events = await c.req.json().then((data) => data.events);
    await Promise.all(events.map(async (event) => {
        try {
            await textEventHandler(client, event);
        }
        catch (err) {
            if (err instanceof Error) {
                console.error(err);
            }
            return c.status(500);
        }
    }));
    return c.status(200);
});
const textEventHandler = async (client, event) => {
    if (event.type !== 'message') {
        return;
    }
    const { replyToken, message } = event;
    if (!replyToken || !message || !event.source.userId)
        return;
    const getMessage = () => {
        if (message.type === 'text') {
            return message.text;
        }
        if (message.type === 'image') {
            return message.id;
        }
        return '';
    };
    const res = await routes(getMessage(), event.source.userId);
    const replyMessageRequest = {
        replyToken: replyToken,
        messages: Array.isArray(res) ? res : [res],
    };
    await client.replyMessage(replyMessageRequest);
};
serve({
    fetch: app.fetch,
    port: 8000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
