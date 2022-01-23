import { Message, MessageEmbed, TextChannel } from "discord.js"
import db from 'quick.db'
import imghash from 'imghash'
import leven from 'leven'
import fs from 'fs'
import request from 'request'
const upvote = 'https://toppng.com/uploads/preview/reddit-clipart-icon-reddit-upvote-transparent-11562895696nryk8bvsps.png'
const downvote = 'https://www.vhv.rs/dpng/d/127-1278380_reddit-downvote-transparent-hd-png-download.png'
export default {
    alias: [],
    expectedArgs: ['<subreddit>'],
    permissionError: '',
    minArgs: 1,
    maxArgs: 99,
    imghash: true,
    async isRepost(): Promise<Boolean> {
        return true 
    },
    async callback(message:Message, Image:string, name: string) : Promise<void> {
        const hashs:string[] = db.get('shitpost.hash') || []
        request.get(Image)
            .on('error', console.error)
            .pipe(fs.createWriteStream('tmp/'+name))
            .on('close', async () => {
                const hash1 = await imghash.hash("tmp/"+name);
                fs.unlink("tmp/"+name, (err) => {})
                for(const hash2 of hashs) {
                    const distance = leven(hash1, hash2);
                    console.log(`Distance between images is: ${distance}`);
                    if (distance <= 5) {
                        return message.reply('Repost atma lan ammmmmcik')
                    }
                }
                db.push('shitpost.hash', hash1)
                message.react('👍')
                message.react('👎')
            })
    },
    category: 'Eğlence',
    description: 'belirtilen r/sub\'dan  gönderileri otomatik çeker.',
    example: '!autopost kgbtr',
    permissions: ['ADMINISTRATOR'],
    requiredRoles: []
}