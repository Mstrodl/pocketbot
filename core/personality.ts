let logger = require('./logger'),
	helpers = require('./helpers'),
	x = require('./vars'),
	fs = require('fs');

//Object defining a bot 'personality', that is, a nickname and an avatar
//name		  : string - represents the display name
//avatar_path   : string - path to the avatar image
//avatar_buffer : string - base64 buffer containing image data
export class Personality{
	public name: string;
	public emote: string;
	public avatar_path: string;
	public avatar_buffer: string;

	public constructor(name, avatar_path, emote){
		if(!name) throw new Error('Empty name given when creating personality');

		if(!avatar_path) throw new Error('Empty avatar face given when creating personality');

		this.name = (helpers.isDebug() ? name + '[DEBUG]' : name);
		this.avatar_path = avatar_path;
		this.emote = emote ? emote : null;
		this.avatar_buffer = fs.readFileSync(avatar_path, 'base64');
	}

	//Sets this personality as the currently active one
	//command_data	: Info object
	set(command_data, callback){
		if(!command_data) throw new Error('No data given. Cannot change personality');

		if(!this.avatar_buffer) throw new Error('Cannot set client personality due to empty avatar buffer');

		let currentnick = command_data.bot.servers[x.chan].members[command_data.bot.id].nick;
		if (currentnick !== this.name) {
			command_data.bot.editNickname({
				serverID: command_data.serverID,
				userID  : command_data.bot.id,
				nick	: this.name
			}, function(err, res) {
				if(err) logger.log(err, logger.MESSAGE_TYPE.Error);
			});
		}

		command_data.bot.editUserInfo({avatar  : this.avatar_buffer}, function(err, res){
			if (err) {
				logger.log(err, logger.MESSAGE_TYPE.Error);
			} else {
				callback(command_data);
			}
		});
	}

	setAvatar(avatar_path, command_data=null, callback=null){
		if(!avatar_path) throw new Error('Empty avatar face given when creating personality');

		this.avatar_path = avatar_path;
		this.avatar_buffer = fs.readFileSync(avatar_path, 'base64');

		if(command_data){
			command_data.bot.editUserInfo({avatar  : this.avatar_buffer}, function(err, res){
				if (err) {
					logger.log(err, logger.MESSAGE_TYPE.Error);
				}else{
					if(callback) callback(command_data);
				}
			});
		}
	}

	setNick(nick, command_data=null, callback=null){
		if(!nick) throw new Error('Invalid nickname given');

		this.name = nick;
		if(command_data){
			command_data.bot.editNickname({
				serverID: command_data.serverID,
				userID  : command_data.bot.id,
				nick: nick
			}, function(err, res){
				console.log(err, res);
				if (err) {
					logger.log(err, logger.MESSAGE_TYPE.Error);
				}else{

					if(callback) callback(command_data);
				}
			});
		}
	}
	
}

