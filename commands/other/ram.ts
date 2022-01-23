import { Client, Message, MessageEmbed } from "discord.js"

export default {
    alias: ['status', 'ram'],
    expectedArgs: [],
    permissionError: '',
    minArgs: 0,
    maxArgs: 0,
    async callback(message:Message, Arguments:string[], {client}:{client:Client}) {
        try {
            const embed = new MessageEmbed()
            .addFields(
                {
                    name: '⚙ Ram',
                    value: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                },
                {
                    name: '📖 Yazı Kanalı',
                    value: client.channels.cache.size + '',
                },
                {
                    name: '🏃 Toplam Sunucu',
                    value: client.guilds.cache.size + '',
                },
                {
                    name: '👩🏻 Toplam üye',
                    value: client.users.cache.size + '',
                })
            message.channel.send({embeds: [embed]})
        } catch (error) {
            return error
        }
    },
    category: 'Diğer',
    description: 'Botun istatistiklerini gösterir.',
    example: '!status',
    permissions: [],
    requiredRoles: []
}