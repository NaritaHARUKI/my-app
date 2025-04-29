import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import * as line from '@line/bot-sdk'
import { getConnection } from './db.js'
import 'dotenv/config'
import routes from './routes/route.js'

type Configs = {
  CHANNEL_ACCESS_TOKEN: string;
  CHANNEL_SECRET: string;
};

const app = new Hono<{ Bindings: Configs }>()

getConnection()

app.post('/webhook', async (c) => {
  const config: line.ClientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!
  }
  const client = new line.messagingApi.MessagingApiClient(config)
  line.middleware({ channelSecret: process.env.CHANNEL_SECRET! })

  const events: line.WebhookEvent[] = await c.req.json().then((data) => data.events)

  await Promise.all(
    events.map(async (event: line.WebhookEvent) => {
      try {
        await textEventHandler(client, event)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err)
        }
        return c.status(500)
      }
    }),
  )

  return c.status(200)
})

// app.post('/multicast', async (c) => {
//   const config: line.ClientConfig = {
//     channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN!
//   }
//   const client = new line.messagingApi.MessagingApiClient(config)

//   const body = await c.req.json()
//   const userIds: string[] = body.userIds
//   const message: string = body.message

//   if (!userIds || userIds.length === 0) {
//     return c.json({ error: 'userIdsが必要です' }, 400)
//   }

//   try {
//     await client.multicast({
//       to: userIds,
//       messages: [{ type: 'text', text: message }]
//     })
//     return c.json({ success: true })
//   } catch (err) {
//     console.error('Multicast送信エラー:', err)
//     return c.json({ error: 'Multicast送信失敗' }, 500)
//   }
// })


const textEventHandler = async (
  client: line.messagingApi.MessagingApiClient,
  event: line.WebhookEvent,
): Promise<line.MessageAPIResponseBase | undefined> => {
  if (event.type !== 'message') {
    return
  }


  const { replyToken, message } = event
  if (!replyToken || !message || !event.source.userId) return

  const getMessage = () => {
    if (message.type === 'text') {
      return message.text
    }
    
    if (message.type === 'image') {
      return message.id
    }

    return ''
  }

  const res = await routes(getMessage(), event.source.userId)

  const replyMessageRequest: line.messagingApi.ReplyMessageRequest = {
    replyToken: replyToken,
    messages: Array.isArray(res) ? res : [res],
  }

  await client.replyMessage(replyMessageRequest)
}


serve({
  fetch: app.fetch,
  port: 8000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
