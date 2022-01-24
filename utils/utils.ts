import options from '../commands/__index.js'
import { Client, Message, TextChannel } from 'discord.js'
import Snoowrap from 'snoowrap'
import db from 'quick.db'
export async function listen(client:Client, r:Snoowrap) {
    const DM = await client.users.fetch('746380170507714670')
    console.log(DM)
    console.log('Loaded utils/listen')
    const autopost:{[key:string]: string} = db.get('autopost')
    for(const [channel, subreddit] of Object.entries(autopost)) {
        for(const option of options) {
            if(option.autopost) {
                option.subreddit = subreddit
                let message:any = await client.channels.cache.get(channel)?.fetch().catch(err => console.log(err))
                if(!message || !message.isText) continue
                option.getSubreddit(message, r, subreddit)
                const Autopost = function(){setTimeout(async () => {
                    message.sendTyping()
                    await option.callback(message, {r, startup: false}).then(x => {
                        console.log(x)
                        Autopost()
                    }).catch(err => console.log)
                    console.log(db.get('autopost.'+channel))
                }, option.timeout)}
                Autopost()
                break
            }
        }
    }
    client.on('messageCreate', async (message) => {
        const { member, content, guild } = message
        const guid = guild?.id?.toString()
        const attachment = message.attachments.first();
        const Image = attachment ? attachment.url : null;
        const Arguments = content.split(/[ ]+/)
        if(guid == undefined) return
        let prefix = '!'
        if(message.author.bot) return
        if(!content.toLowerCase().startsWith(`${prefix}`) && Image && attachment && attachment.size < 8000000) {
            for(const option of options) {
                if(option.imghash) {
                    console.log(attachment)
                    const name = attachment?.name
                    if(!message || !message.channel.isText) continue
                        option.callback(message, Image, name, attachment?.contentType)
                    break
                }
            }
        }
        for(const option of options) {
            if(option.alias)
            for(const alias of option.alias) {
                if(content.toLowerCase().slice(prefix.length, (Arguments[0].length)) !== alias) continue
                if(!check_Arguments(Arguments, message, {minArgs: option.minArgs, maxArgs: option.maxArgs, expectedArgs: option.expectedArgs})) return
                message.channel.sendTyping()
                if(option.autopost) {
                    db.set('autopost.'+message.channelId, Arguments[1])
                    const Autopost = function(timeout){
                            setTimeout(async () => {
                            message.channel.sendTyping()
                            option.callback(message, {r}).then(x => {
                                if(db.get('autopost.'+message.channelId) == Arguments[1]) {
                                    Autopost(option.timeout)
                                }
                            }).catch(err => console.log)
                        }, timeout)
                    }   
                    Autopost(500)
                    return
                }
                option.callback(message, Arguments, {r, client})
                .catch(async (err) => {
                    if(err) {
                        console.log(err)
                        await (await DM.createDM()).send(err.stack.slice(0, 2000) || 'Hata.')
                        message.reply('Bir hata meydana geldi :(')
                    }
                })
                return
            } 
        }
    })
    client.on('guildMemberAdd', async (member) => {
        const guild = member.guild
        console.log({
            id: guild.id,
            memberCount: guild.memberCount,
            name: guild.name,
            ownerID: guild.ownerId,
        })
    })
}
export function check_Arguments(Arguments, message, {minArgs = 0, maxArgs = 0, expectedArgs}) { 
    if(Arguments.length < minArgs ) {
        message.lineReply(`Yetersiz argüman: ${Arguments[0]}${Arguments[1]} ${expectedArgs}`)
        return false
    }
    if((maxArgs && Arguments.length > maxArgs)) {
        message.lineReply(`Yanlış argüman! doğru kullanım: ${Arguments[0]}${Arguments[1]} ${expectedArgs}`)
        return false
    }
    return true
}