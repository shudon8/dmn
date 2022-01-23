import dotenv from 'dotenv'
dotenv.config()
import { ShardingManager } from 'discord.js'
const manager = new ShardingManager('./app.js', {token: process.env.DISCORD_clientSecret})
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`))
manager.spawn()