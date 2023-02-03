const { SlashCommandBuilder } = require("discord.js")
const { client } = require("../index")
const fs = require("node:fs")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("edit")
        .setDescription("Edits the server configuration")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel to output to")
        )
        .addRoleOption(option =>
            option.setName("live_role")
                .setDescription("Role to ping on live")
        )
        .addRoleOption(option =>
            option.setName("authorized_role")
                .setDescription("Role authorized to use the bot")
        ),
    async execute(msg) {
        const guild = msg.guildId
        const channel = msg.options.getChannel("channel")
        const liveRole = msg.options.getRole("live_role", false)
        const AuthRole = msg.options.getRole("authorized_role", false)
        if (liveRole !== null) {
            client.watcher[guild]["liveRole"] = liveRole.id.toString()
        }
        if (AuthRole !== null) {
            client.watcher[guild]["authRole"] = AuthRole.id.toString()
        }
        if (channel !== null) {
            client.watcher[guild]["channelId"] = channel.id.toString()
        }

        fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher, null, 4), "utf-8")
        msg.reply("Success")
    }
}