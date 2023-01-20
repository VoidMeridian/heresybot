const { REST, Routes } = require("discord.js")
const fs = require("node:fs")
const path = require("node:path")
const dotenv = require("dotenv")
dotenv.config()
//this is to create slash commands inside of discord on a server


const commands = []
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith("js"))
console.log(commandFiles)
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file)
	const command = require(filePath)
	commands.push(command.data.toJSON())
}

const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN)

rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands })
	.then(() => {
		console.log("Succesfully registered application commands")
		process.exit(0) // this is necessary because otherwise it starts the bot without me
	})
	.catch(console.error)
