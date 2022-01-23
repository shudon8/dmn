import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'
dotenv.config()
const client = new Client({ partials: ["CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] })
import {listen} from './utils/utils.js'
import snoowrap from 'snoowrap'
const r = new snoowrap({
  clientId: process.env.REDDIT_clientId,
  refreshToken: process.env.REDDIT_refreshToken,
  accessToken: process.env.REDDIT_accessToken,
  userAgent: 'Node.js Discord bot',
  clientSecret: process.env.REDDIT_clientSecret
})
client.on('ready', async () => {
  listen(client, r)
  const Guilds = client.guilds.cache.map(guild => {
    return {
      id: guild.id,
      name: guild.name,
      member: guild.memberCount
      }
  })
})
client.login(process.env.DISCORD_clientSecret)