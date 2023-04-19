const { client } = require("./index")
const { Events,  PermissionsBitField } = require("discord.js")

const { execSync } = require("node:child_process")

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
	console.log("Command Interaction")
	if (client.watcher[interaction.guildId] == null && interaction.commandName !== "setup") {
		console.log("Setup command not run")
		interaction.reply("Please run the setup")
		return
	}
	var authrole;
	if (interaction.commandName !== "setup") {
		if (client.watcher[interaction.guildId]["authRole"] !== null) {
			authrole = interaction.member.roles.cache.has(client.watcher[interaction.guildId]["authRole"])
		} else {
			authrole = true
		}
		console.log("authrole set")
	} else {
		authrole = true
	}
	if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) || authrole || interaction.member.id === "419343503110438922" || interaction.member.id === "538043155480576050") {
		if (!interaction.isChatInputCommand()) return


		var command = interaction.client.commands.get(interaction.commandName)

		if (!command) {
			console.log(`No command matching ${interaction.commandName} was found.`)
			return
		}

		try {
			console.log("command run")

			await command.execute(interaction)
		} catch (error) {
			console.log(error)
			await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
		}
	} else {
		console.log("unauthorized user")
		interaction.reply("You are not authorized to use the bot")
	}
})

client.on(Events.Debug, async string => {
    console.log("DEBUG: " + string)
})

client.on(Events.Error, async error => {
    console.log("ERROR: " + error.name + " " + error.message + " caused by " + error.cause)
})

client.on(Events.Warn, async string => {
    console.log("WARN: " + string)
})

client.on(Events.Invalidated, async () => {
    console.log("Fatal error has occurred");
    exec("pm2 stop Heresy");
})

client.on(Events.MessageCreate, async msg => {
    if ((msg.author.id === "419343503110438922" || msg.author.id === "538043155480576050") && msg.channelId === "1089347772324520046") {
		msg.reply("> " + execSync(msg.content));
	}
})