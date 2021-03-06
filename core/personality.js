var logger = require('./logger');
var fs = require('fs');

//Object defining a bot 'personality', that is, a nickname and an avatar
//name		  : string - represents the display name
//avatar_path   : string - path to the avatar image
//avatar_buffer : string - base64 buffer containing image data
var Personality = function(name, avatar_path, emote){
	if(!name) throw new Error('Empty name given when creating personality');

	if(!avatar_path) throw new Error('Empty avatar face given when creating personality');

	this.name = name;
	this.avatar_path = avatar_path;
	this.emote = emote ? emote : null;
	this.avatar_buffer = fs.readFileSync(avatar_path, 'base64');
}

//Sets this personality as the currently active one
//command_data	: Info object
Personality.prototype.set = function(command_data, callback){
	if(!command_data) throw new Error('No data given. Cannot change personality');

	if(!this.avatar_buffer) throw new Error('Cannot set client personality due to empty avatar buffer');

	command_data.bot.editNickname({ serverID: command_data.serverID,
									userID  : command_data.bot.id,
									nick	: this.name},
									function(err, res){
										if(err) logger.log(err, logger.MESSAGE_TYPE.Error);
	});

	command_data.bot.editUserInfo({avatar  : this.avatar_buffer}, function(err, res){
		if (err) {
			logger.log(err, logger.MESSAGE_TYPE.Error);
		} else {
			callback(command_data);
		}
	});
}



Personality.prototype.setAvatar = function(avatar_path, command_data=null, callback=null){
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

Personality.prototype.setNick = function(nick, command_data=null, callback=null){
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

module.exports = Personality;
