import { Message, MessageEmbed, TextChannel } from "discord.js"
import db from 'quick.db'
import imghash from 'imghash'
import leven from 'leven'
import fs from 'fs'
import request from 'request'
import ffmpeg from '@ffmpeg-installer/ffmpeg'
import ffprobe from '@ffprobe-installer/ffprobe'
import videoHash from 'video-hash'
import crypto from 'crypto'
const vHash = new videoHash({
    ffmpegPath: ffmpeg.path,
    ffprobePath: ffprobe.path
})
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
    async callback(message:Message, Image:string, name: string, type: string) : Promise<void> {
        const hashs:string[] = db.get('shitpost.hash') || []
        if(message.content.length > 250) {
            const hash1 = crypto.createHash('sha256').update(message.content).digest('hex')
            for(const hash2 of hashs) {
                if(!hash2 || hash2 == 'undefined') {
                    continue
                }
                const distance = leven(hash1, hash2);
                console.log(`Distance between images is: ${distance}`);
                if (distance <= 8) {
                    message.reply('Repost atma lan ammmmmcik')
                    return
                }
            }
            db.push('shitpost.hash', hash1)
            message.react('👍')
            message.react('👎')
            return
        }
        request.get(Image)
            .on('error', console.error)
            .pipe(fs.createWriteStream('tmp/'+name))
            .on('close', async () => {
                var video:any 
                if(type == 'video/mp4')
                video = vHash.video("tmp/"+name)
                const hash1 = video ? await video.hash({strength: 1}) : await imghash.hash("tmp/"+name)
                if(!hash1 || typeof hash1 !== 'string') return
                fs.unlink("tmp/"+name, (err) => {})
                db.set('shitpost.hash', hashs.filter((hash) => {
                    console.log()
                    return hash && typeof hash === "string"
                }))
                for(const hash2 of hashs) {
                    if(!hash2 || hash2 == 'undefined') {
                        continue
                    }
                    const distance = leven(hash1, hash2);
                    console.log(`Distance between images is: ${distance}`);
                    if (distance <= 8) {
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