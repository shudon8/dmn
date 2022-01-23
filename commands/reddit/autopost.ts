import { Message, MessageEmbed, TextChannel } from "discord.js"
import db from 'quick.db'
import snoowrap from 'snoowrap'
const upvote = 'https://toppng.com/uploads/preview/reddit-clipart-icon-reddit-upvote-transparent-11562895696nryk8bvsps.png'
const downvote = 'https://www.vhv.rs/dpng/d/127-1278380_reddit-downvote-transparent-hd-png-download.png'
const subreddits = new Map()
const posts = new Map()
export default {
    alias: ['autopost'],
    expectedArgs: ['<subreddit>'],
    permissionError: '',
    minArgs: 1,
    maxArgs: 99,
    timeout: 600000,
    subreddit: '',
    autopost: true,
    async getSubreddit(message:Message, r: snoowrap, subreddit: string) {
        const channel = message.channel || message 
        var sub = subreddits.get(subreddit)
        if(!sub) {
            sub = r.getSubreddit(subreddit)
            const subPost = await r.getSubreddit(subreddit).getHot({limit: 200})
            posts.set(subreddit, subPost)
            return subPost
        }
        if(!sub) {
            channel.send('Aradığın subredditi bulamadım :confused:')
            return false
        }
        subreddits.set(subreddit, sub)
        return sub
    },
    async callback(message:any, {r}:{r: snoowrap}) : Promise<Boolean> {
        const channel:TextChannel = message.channel || message 
        const subreddit = db.get('autopost.'+message.channelId)
        const sub = await this.getSubreddit(message, r, subreddit)
        var subredditPosts = posts.get(subreddit)
        var post
        var sent = db.get('index.'+channel.id+'.'+subreddit) || (db.set('index.'+channel.id+'.'+subreddit, []) && [])
        while(!post) {
            for(const needle of posts.get(subreddit)) {
                if(sent.includes(needle.id)) continue
                if(needle.media) continue
                post = {
                    'title': needle.title,
                    'url': needle.url,
                    'mp4': needle.media?.reddit_video?.fallback_url,
                    'ups': needle.ups,
                    'downs': needle.downs,
                    'author': needle.author.name,
                    'authorImg': needle.author.icon_img,
                    'score': needle.score,
                    'ratio': needle.upvote_ratio,
                    'thumbnail': needle.thumbnail,
                    'media': needle.is_self,
                    'isVideo': needle.is_video,
                    'id': needle.name,
                    'text': needle.selftext,
                    'nsfw': needle.over_18
                }
                db.push('index.'+channel.id+'.'+subreddit, needle.id)
                break
            }
            if(post) break
            try {
                subredditPosts = await subredditPosts.fetchMore({amount: 100})
                posts.get(subreddit).push(subredditPosts)
            } catch (error) {
                console.log(error, 'error')
                return false
            }
        }
        if(sub.over18 && !channel.nsfw) {
                channel.send('Bu subredditi görüntüleyebilmek için kanalın NSFW olması gerek :confused:')
            return false
        }
        const vote = post.score < 0 ? downvote : upvote
        const text = '[[İndir]]('+post.url+')\n videolar oynatılamıyor'
        try {
            const Embed = new MessageEmbed()
            .setTitle(post.title.slice(0, 256))
            .setDescription(text)
            .setAuthor({name: post.author})
            .setFooter({text: `upvote: ${post.ups} downvote: ${post.downs} oran: ${post.ratio}`,  iconURL: vote})
            .setImage((post.isVideo && post.thumbnail) || post.url)
            channel.send({embeds: [Embed]})
        } catch (error) {
            channel.send('Bir hata meydana geldi, özür dilerim :pensive:')
        }
        return true
    },
    category: 'Eğlence',
    description: 'belirtilen r/sub\'dan  gönderileri otomatik çeker.',
    example: '!autopost kgbtr',
    permissions: ['ADMINISTRATOR'],
    requiredRoles: []
}