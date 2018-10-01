const needle = require("needle");
const Discord = require('discord.js');

const moduleConfig = require("./config");


module.exports = class remoteCommands {
	//mergedConfig is the plugin config
	//messageInterface is a async function(data, callback)
	constructor(mergedConfig, messageInterface, extras){
		this.messageInterface = messageInterface;
		this.config = mergedConfig;
		this.socket = extras.socket;
		this.instances = {};

		if (moduleConfig.discord_enable_chatlog) {
			this.hook = new Discord.WebhookClient(moduleConfig.discord_webhook_id, moduleConfig.discord_webhook_token);
		}
		this.socket.on("hello", () => this.socket.emit("registerChatReciever"));
	}

	getMessageType(data) {
		if (data.includes("[CHAT]")) {
			return "[CHAT]";
		} else if (data.includes("[JOIN]")) { 
			return "[JOIN]";
		} else if (data.includes("[LEAVE]")) {
			return "[LEAVE]";
		}
	}

	//// when factorio logs a line, send it to the plugin. This includes things like autosaves, chat, errors etc
	async factorioOutput(data){
		try{
			if (moduleConfig.discord_enable_chatlog) {
				let messageType = this.getMessageType(data);

				if (messageType=="[CHAT]" || messageType=="[JOIN]" || messageType=="[LEAVE]"){
					let message = this.cleanMessage(data, messageType);
					let instance = await this.getInstanceName(this.config.unique.toString());
	
					if (messageType=="[CHAT]") {
						this.hook.send("**[" + instance + "]** " + message);
					} else if (messageType=="[JOIN]") {
						this.hook.send("**[" + instance + "]** " + message);
					} else if (messageType=="[LEAVE]") {
						this.hook.send("**[" + instance + "]** " + message);
					}
				}
			}
		} catch(e) {console.log(e)}
	}

	cleanMessage(data, messageType) {
		if (messageType=="[CHAT]") {
			let words = data.trim().split(" ");
			words.shift();
			words.shift();
			words.shift();
			return words.join(" ").replace(/[";]/g, " ").replace(/[']/g,"").replace("/shout ", "").replace("!shout", "");
		} else if (messageType=="[LEAVE]" || messageType=="[JOIN]") {
			let words = data.trim().split(messageType);
			return words[1].trim();
		}
	}
	
	getInstanceName(instanceID){
		return new Promise((resolve, reject) => {
			let instance = this.instances[instanceID];
			if(!instance){
				needle.get(this.config.masterIP+":"+this.config.masterPort+ '/api/slaves', (err, response) => {
					if(err || response.statusCode != 200) {
						console.log("Unable to get JSON master/api/slaves, master might be unaccessible");
					} else if (response && response.body) {	
						if(Buffer.isBuffer(response.body)) {console.log(response.body.toString("utf-8")); throw new Error();}
							try {
								for (let index in response.body)
									this.instances[index] = response.body[index].instanceName;
							} catch (e){
								console.log(e);
								return null;
							}
						instance = this.instances[instanceID] 							
						if (!instance) instance = instanceID;  //somehow the master doesn't know the instance	
						resolve(instance);
					}
				});
			} else {
				resolve(instance);
			}
		});
	}
}
