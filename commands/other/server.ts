import { Message, MessageEmbed, TextChannel } from "discord.js"

export default {
    alias: ['sunucu', 'server'],
    expectedArgs: [],
    permissionError: '',
    minArgs: 0,
    maxArgs: 0,
    checkDays(date) {
        let now = new Date();
        let diff = now.getTime() - date.getTime();
        let days = Math.floor(diff / 86400000)
        console.log(days)
        var year = 0
        while(days > 365) {
            year++
            days = days - 365
        }
        if(year) {
            return year+' yıl önce'
        }
        return days + 'gün önce'
    },
    async callback(message:Message) {
        try {
            if(!message.guild) return
            const GuildIcon = message.guild?.iconURL()
            const embed = new MessageEmbed()
            .addFields(
                {
                    name: 'Hakkında',
                    value: `**Oluşturuldu**: ${this.checkDays(message.guild?.createdAt)} 
                            **ID**: \`${message.guild.id}\`
                            **Dil**: \`${message.guild.preferredLocale}\`
                            **Nitro Seviyesi**: ${message.guild.premiumTier} 
                            **Sahibi**: <@${message.guild.ownerId}> 
                            **Sunucu Tipi**: ${(message.guild?.large) ? 'Özel' : 'Herkese Açık'}
                    `,
                    inline: true
                },
                {
                    name: 'Moderasyon',
                    value: `**AFK zaman aşımı**: ${message.guild.afkTimeout} Saniye
                            **AFK kanalı**: ${message.guild.afkChannelId ?? 'Belirsiz'}
                            **Mesaj Bildirimi**: ${message.guild.defaultMessageNotifications}
                            **MFA**: ${message.guild.mfaLevel}
                            **Verifikasyon**: ${message.guild.verificationLevel}
                    `,
                    inline: true
                }
            )
            if(GuildIcon) embed.setThumbnail(GuildIcon)
            if(GuildIcon) embed.setAuthor({name: message.guild.name, iconURL: GuildIcon})
            message.channel.send({embeds: [embed]})
        } catch (error) {
            if(error) return error
        }
    },
    category: 'Moderasyon',
    description: 'Sunucu hakkındaki bilgileri gösterir.',
    example: '!sunucu',
    permissions: [],
    requiredRoles: []
}