const fs = require("node:fs")
// var access = fs.createWriteStream('./bot.log', 'utf-8');
// process.stdout.write = process.stderr.write = access.write.bind(access);
console.log("configuring output file")
const path = require("node:path")
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js")
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
async function getStream(key) {
	// console.log(streamer)
	if (client.watcher["streamers"][key] == null) return
	var streamer = client.watcher["streamers"][key]
	var platform = streamer["platform"]
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
			if (!streamer["cached"]) {
				console.log(streamer["name"] + " not checked")
				for (const i in streamer["guilds"]) {
					var guildId = streamer["guilds"][i]
					var guildInfo = client.watcher[guildId]
					var liveChannel = client.channels.resolve(guildInfo["channelId"])
					var liveRole = guildInfo["liveRole"]
					if (liveRole == null) {
						liveChannel.send({ content: user.displayName + " is live playing " + stream.gameName, embeds: [embed] });
					} else {
						liveChannel.send({ content: "<@&" + liveRole + "> " + user.displayName + " is live playing " + stream.gameName, embeds: [embed] });
					}
				}

				streamer["cached"] = true
			}
		} else {
			console.log(streamer["name"] + " not live")

			streamer["cached"] = false
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
			// console.log(JSON.stringify(streamer, null, 4))

			if (!streamer["cached"]) {
				console.log(streamer["name"] + " not checked")
				for (const i in streamer["guilds"]) {
					var guildId = streamer["guilds"][i]
					var guildInfo = client.watcher[guildId]
					var liveChannel = client.channels.resolve(guildInfo["channelId"])
					var liveRole = guildInfo["liveRole"]

					if (liveRole == null) {
						liveChannel.send({ content: channel.username + " is live playing " + channel.category_name, embeds: [embed] });
					} else {
						liveChannel.send({ content: "<@&" + liveRole + "> " + channel.username + " is live playing " + channel.category_name, embeds: [embed] });
					}
				}
				streamer["cached"] = true
			}

		} else {
			console.log(streamer["name"] + " not live")
			streamer["cached"] = false
		}


	}
	client.watcher["streamers"][key]["cached"] = streamer["cached"]
	fs.writeFileSync("./watcher.json", JSON.stringify(client.watcher, null, 4), "utf-8")
	setTimeout(() => getStream(key), 60000 + (240000 * Math.random()))
}

console.log("setting timers initial timer")
for (const streamer in client.watcher["streamers"]) {
	// console.log(streamer)
	setTimeout(() => getStream(streamer), 60000)
}

client.login(process.env.DISCORD_TOKEN)
