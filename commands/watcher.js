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
                            option.setName("platforms")
                                .setDescription("Platforms the streamer plays on")
                                .setRequired(true)
                    ))
        .addSubcommand(
            cmd =>
                cmd.setName("remove")
                    .setDescription("Removes a streamer from the watcher")
                    .addStringOption(option => option.setName("channel").setDescription("Streamer name").setRequired(true))
        ),

    async execute(interaction) {
        const guild = interaction.guildId;
        const platform = interaction.options.getString("platforms")
        const key = interaction.options.getString("channel")
        if (interaction.options.getSubcommand() === "add") {

            client.watcher[guild]["streamers"][key] = {
                "name": key,
                "checked": false,
            }
            var platformArr = platform.split(",")
            client.watcher[guild]["streamers"][key]["platforms"] = []
            for (var string of platformArr) {
                string = string.replace(/\s/g, '').toLowerCase();
                client.watcher[guild]["streamers"][key]["platforms"].push(string)
            }

            fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher), "utf-8")
            client.timers.push(setInterval(() => {
                getStream(key, false)
            }, 60000))
            console.log(JSON.stringify(client.watcher))
            interaction.reply({ content: "Success", ephemeral: true })
        } else if (interaction.options.getSubcommand === "remove") {
            delete client.watcher[guild]["streamers"][key]
            fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher), "utf-8")
            console.log(client.watcher[key])
            interaction.reply({ content: "key: " + key + " has been deleted", ephemeral: true })
        }
    }
}