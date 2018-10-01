/*
	Clusterio plugin to allow for chat between instances.
*/
module.exports = {
	// Name of package. For display somewhere I guess.
	name: "discordChat",
	version: "1.0.0",
	binary: "nodePackage",
	description: "Clusterio plugin to allow for chat to discord",

    // Enable chat/join/leave logging to discord. You must 'npm install discord.js' for this to work.
    discord_enable_chatlog: false,

    // The discord webhook ID to log messages to.
    discord_webhook_id: "",

    // Webhook token for discord logging
    discord_webhook_token: ""
}