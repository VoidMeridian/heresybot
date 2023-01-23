const { SlashCommandBuilder } = require("discord.js")
const index = require("../index")
const fs = require("node:fs")

function version() {
    return "1.0.1"
}

function read() {
    return fs.readFileSync("./bot.log", "utf-8")
}

function config() {
    return fs.readFileSync("./watcher.json", "utf-8")
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName("eval")
        .setDescription("Developer only")
        .addStringOption(option => option.setName("cmd").setDescription("Command to evaluate")),
    async execute(msg) {
        if (msg.user.id.toString() != "419343503110438922") {
            index.client.users.cache.get("419343503110438922").send("<@!419343503110438922> " + msg.user.username + " tried accessing eval")
            msg.reply("You're not allowed")
        } else {
            var cmd = msg.options.getString("cmd")
            msg.reply({ content: "result: " + eval(cmd), ephemeral: true })
        }
    }


}