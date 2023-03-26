const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const { client } = require("../index")


module.exports = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("Sends the server configuration to a user"),
    async execute(msg) {
        const embed = new EmbedBuilder()
        const server = client.watcher[msg.guildId]
        embed.setTitle(msg.guild.name)
        embed.setAuthor({ name: msg.member.nickname })
        embed.setDescription("Live Channel: " + client.channels.resolve(server["channelId"]).name)
        for (const value in client.watcher["streamers"]) {
            const streamer = client.watcher["streamers"][value]
            if (streamer["guilds"].contains(msg.guildId)) {
                embed.addFields({ name: streamer["name"], value: streamer["platform"], inline: true })
            }
        }
        if (server["liveRole"] != null) {
            embed.addFields({ name: "Live Role", value: client.guilds.resolve(msg.guildId).roles.resolve(server["liveRole"]).name, inline: false })
        }
        if (server["authRole"] != null) {
            embed.addFields({ name: "Authorized Role", value: client.guilds.resolve(msg.guildId).roles.resolve(server["authRole"]).name, inline: false })
        }
        msg.reply({content: "Server Config", embeds: [embed], ephemeral: true})
    }
}