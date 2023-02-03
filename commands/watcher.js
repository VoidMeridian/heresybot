const { SlashCommandBuilder } = require("discord.js")
const axios = require("axios")
const { apiClient, client, getStream } = require("../index")
const fs = require("node:fs")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("watcher").setDescription("Sets up stream watchers for multiple platforms")
        .addSubcommand(
            cmd =>
                cmd.setName("add")
                    .setDescription("Adds a stream to the stream watcher list")
                    .addStringOption(
                        option =>
                            option.setName("channel")
                                .setDescription("Name of the streamer")
                                .setRequired(true)
                    )
                    .addStringOption(
                        option =>
                            option.setName("platform")
                                .setDescription("Platform the streamer plays on")
                                .addChoices({name: "Twitch", value: "twitch"}, {name: "Trovo", value: "trovo"})
                                .setRequired(true)
                    ))
        .addSubcommand(
            cmd =>
                cmd.setName("remove")
                    .setDescription("Removes a streamer from the watcher")
                    .addStringOption(
                        option =>
                            option.setName("platform")
                                .setDescription("Platform the streamer plays on")
                                .addChoices({name: "Twitch", value: "twitch"}, {name: "Trovo", value: "trovo"})
                                .setRequired(true)
                    )
                    .addStringOption(option => option.setName("channel").setDescription("Streamer name").setRequired(true))
        ),

    async execute(interaction) {
        var number = 0
        const guild = interaction.guildId.toString();
        const platform = interaction.options.getString("platform")
        var key = interaction.options.getString("channel") + ":" + number
        if (interaction.options.getSubcommand() === "add") {
            if (client.watcher["streamers"][key] == null) {
                client.watcher["streamers"][key] = {
                    "name": interaction.options.getString("channel"),
                    "platform": platform,
                    "guilds": [],
                    "cached": false,
                }
            setTimeout(() => getStream(key), 60000)

            } else if (client.watcher["streamers"][key]["platform"] != platform)
            {

                number+=1
                console.log(number + " SKIPPED " + key)
                key = interaction.options.getString("channel") + ":" + number

            }
            client.watcher["streamers"][key]["guilds"].push(guild)
            fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher, null, 4), "utf-8")
            interaction.reply({ content: "Success", ephemeral: true })
        } else if (interaction.options.getSubcommand() === "remove") {
            if (client.watcher["streamers"][key]["platform"] != interaction.options.getString("platform"))
            {
                number++
                key = interaction.options.getString("channel") + ":" + number
            }
            client.watcher["streamers"][key]["guilds"] = client.watcher["streamers"][key]["guilds"].filter((value, _t, _i) => {
                return value != guild
            })
            if (client.watcher["streamers"][key]["guilds"].length == 0) {
                delete client.watcher["streamers"][key]
            }
            fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher, null, 4), "utf-8")
            interaction.reply({ content: "key: " + key + " has been deleted", ephemeral: true })
        }
    }
}