let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x = require('../core/vars'),
	dio = require('../core/dio'),
	// Smaller, local array so I don't have to iterate through
	// every online user's role everytime...
	challengers = [];

let cmdCrown = new command('crown', '!crown', `This will give the referenced user the Crown role`, function(data) {
	let chan = data.channelID,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles;

	if (uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		logger.log('Crowning...', logger.MESSAGE_TYPE.OK);
		let k = data.args[1];
		if (k != undefined) {
			dio.del(data.messageID, data);

			// Can't give crown to crown holder
			if (data.bot.servers[x.chan].members[k].roles.includes(x.king)) {
				dio.say(`🕑 <@${k}> already has the Crown!`, data);
				return false;
			}

			data.bot.addToRole({
				serverID: x.chan,
				userID: k,
				roleID: x.king
			}, function(err,resp) {
				if (!err) dio.say(`:crown: <@${k}> has obtained the Crown!`, data);
			});
		} else {
			dio.say("🕑 Hmm, that user doesn't exist. Did you @ them correctly?", data);
		}
	}
});

let cmdDecrown = new command('crown', '!decrown', `This will remove the referenced user from the Crown role`, function(data) {
	let chan = data.channelID,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles;

	if (uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		logger.log('Decrowning...', logger.MESSAGE_TYPE.OK);
		let k = data.args[1];
		if (k != undefined) {
			dio.del(data.messageID, data);

			if (!data.bot.servers[x.chan].members[k].roles.includes(x.king)) {
				dio.say(`🕑 <@${k}> is just a peasant it seems.`, data);
				return false;
			}
			// Remove from king
			bot.removeFromRole({
				serverID: x.chan,
				userID: k,
				roleID: x.king
			}, function(err,resp) {
				logger.log("Error: " + err, logger.MESSAGE_TYPE.Error);
				logger.log("Response: " + resp, logger.MESSAGE_TYPE.Warn);
				dio.say(`The <@&${x.king}> has been taken!`, data);
			});
		} else {
			dio.say("🕑 Hmm, that user doesn't exist. Did you @ them correctly?", data);
		}
	}
});

let cmdChallenge = new command('crown', '!challenge', `This issues a challenge to the current Crown holder`, function(data) {
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles;

	dio.del(data.messageID, data);

	if (challengers.includes(from)) {
		dio.say(`🕑 <@${fromID}>, you already challenged for the Crown in the past 24 hours.`, data);
	} else {
		if (data.bot.servers[x.chan].members[fromID].roles.includes(king)) {
			dio.say(`🕑 You can't challenge yourself, silly.`, data);
			return false;
		}

		dio.say(`:crossed_swords: <@${fromID}> has challenged for the <@&${king}>`, data);
		challengers.push(from);
		// 24h timer - doesn't seem to work right
		setTimeout(function(){
			let i = challengers.indexOf(from);
			if (i>-1) challengers.splice(i, 1)
		}, 1000*60*60*24);
	}
});

module.exports.commands = [cmdChallenge, cmdDecrown, cmdCrown];
