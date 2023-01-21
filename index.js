const fs = require("node:fs")
var access = fs.createWriteStream('./bot.log', 'utf-8');
process.stdout.write = process.stderr.write = access.write.bind(access);
console.log("configuring output file")
const path = require("node:path")
const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField } = require("discord.js")
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates] })
const dotenv = require("dotenv")
dotenv.config()
const { TrovoAPI } = require("simple-trovo-api");
const Trovo = new TrovoAPI({
	client_id: process.env.TROVO_ID,
	client_secret: process.env.TROVO_SECRET,
	redirect_uri: "http://localhost:1337/"
});
const { ApiClient } = require("twitch")
const { ClientCredentialsAuthProvider } = require("twitch-auth")
const authProvider = new ClientCredentialsAuthProvider(process.env.TWITCH_ID, process.env.TWITCH_SECRET)
const apiClient = new ApiClient({ authProvider })
console.log("initializing api")

exports.client = client
exports.apiClient = apiClient
client.commands = new Collection()
client.watcher = require("./watcher.json")
client.timers = []
exports.getStream = getStream
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"))
for (var file of commandFiles) {
	var filePath = path.join(commandsPath, file)
	var command = require(filePath)

	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command)
	}
}
console.log("initializing commands")
async function getStream(streamer, guild) {
	console.log(guild)
	var platforms = streamer["platforms"]
	var liveRole = client.watcher[guild]["liveRole"]
	var liveChannel = client.channels.resolve(client.watcher[guild]["channelId"])
	for (const platform of platforms) {
		if (platform == "twitch") {
			var user = await apiClient.helix.users.getUserByName(streamer["name"]);
			if (!user) {
				return;
			}
			var stream = await user.getStream() // stream is null if not live
			if (stream) { //check stops repeat announcements
				console.log(streamer["name"] + " is live")

				var embed = new EmbedBuilder()
					.setColor(0x6441a5)
					.setTitle(user.displayName + " is playing " + stream.gameName)
					.setURL("https://twitch.tv/" + user.name)
					.setAuthor({ name: user.displayName, iconURL: user.logoUrl, url: "https://twitch.tv/" + user.name })
					.setDescription(stream.title)
					.setThumbnail(user.profilePictureUrl)
				if (!streamer["checked"]) {
					console.log(streamer["name"] + " not checked")
					if (liveRole == null) {
						liveChannel.send(user.displayName + " is live playing " + stream.gameName);
					} else {
						liveChannel.send("<@&" + liveRole + "> " + user.displayName + " is live playing " + stream.gameName);
					}
					liveChannel.send({ embeds: [embed] })
					streamer["checked"] = true
				}
			} else {
				console.log(streamer["name"] + " not live")

				streamer["checked"] = false
			}

		} else if (platform == "trovo") {
			var channel = await Trovo.channels.get(streamer["name"])
			if (channel.is_live) {// todo try this
				console.log(streamer["name"] + " is live")
				var embed = new EmbedBuilder()
					.setTitle(channel.username + " is playing " + channel.category_name)
					.setURL(channel.channel_url)
					.setColor(0x1bab78)
					.setAuthor({ name: channel.username, iconURL: channel.profile_pic, url: channel.channel_url })
					.setDescription(channel.live_title)
					.setThumbnail(channel.profile_pic)
				console.log(JSON.stringify(streamer))

				if (!streamer["checked"]) {
					console.log(streamer["name"] + " not checked")
					if (liveRole == null) {
						liveChannel.send(channel.username + " is live playing " + channel.category_name);
					} else {
						liveChannel.send("<@&" + liveRole + "> " + channel.username + " is live playing " + channel.category_name);
					}
					liveChannel.send({ embeds: [embed] })
					streamer["checked"] = true
				}

			} else {
				console.log(streamer["name"] + " not live")
				streamer["checked"] = false
			}

		}

	}
	client.watcher[guild]["streamers"][streamer.name] = streamer
	fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher), "utf-8")
}
console.log("setting timers")
for (const guild in client.watcher) {
	for (const streamer in client.watcher[guild]["streamers"]) {
		client.timers[streamer] = (setInterval(() => {
			getStream(client.watcher[guild]["streamers"][streamer], guild)
		}, 60000 + (240000 * Math.random())))
	}
}
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
	if (interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) || authrole) {
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

client.login(process.env.DISCORD_TOKEN)
