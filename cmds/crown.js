let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x = require('../core/vars'),
	// Smaller, local array so I don't have to iterate through
	// every online user's role everytime...
	challengers = [];

let cmdCrown = new command('crown', '!crown', `This will give the referenced user the Crown role`, function(data) {
	let chan = data.channelID,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		say = function(msg) {
			data.bot.sendMessage({
				to: chan,
				message: msg
			});
		};;

	if (uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		console.log('Crowning...');
		let k = data.args[1];
		if (k != undefined) {
			setTimeout( function() {
				data.bot.deleteMessage({
					channelID: chan,
					messageID: data.messageID
				});
			}, 100);

			// Can't give crown to crown holder
			if (data.bot.servers[x.chan].members[k].roles.includes(x.king)) {
				say(`🕑 <@${k}> already has the Crown!`);
				return false;
			}

			data.bot.addToRole({
				serverID: chan,
				userID: k,
				roleID: x.king
			}, function(err,resp) {
				if (!err) say(`:crown: <@${k}> has obtained the Crown!`);
			});
		} else {
			say("🕑 Hmm, that user doesn't exist. Did you @ them correctly?");
		}
	}
});

let cmdDecrown = new command('crown', '!decrown', `This will remove the referenced user from the Crown role`, function(data) {
	let chan = data.channelID,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		say = function(msg) {
			data.bot.sendMessage({
				to: chan,
				message: msg
			});
		};

	if (uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		console.log('Decrowning...');
		let k = data.args[1];
		if (k != undefined) {
			setTimeout( function() {
				data.bot.deleteMessage({
					channelID: chan,
					messageID: data.messageID
				});
			}, 100);

			if (!data.bot.servers[x.chan].members[k].roles.includes(x.king)) {
				say(`🕑 <@${k}> is just a peasant it seems.`);
				return false;
			}
			// Remove from king
			bot.removeFromRole({
				serverID: chan,
				userID: k,
				roleID: x.king
			}, function(err,resp) {
				console.log(err,resp);
				say(`The <@&${x.king}> has been taken!`);
			});
		} else {
			say("🕑 Hmm, that user doesn't exist. Did you @ them correctly?");
		}
	}
});

let cmdChallenge = new command('crown', '!challenge', `This issues a challenge to the current Crown holder`, function(data) {
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		say = function(msg) {
			data.bot.sendMessage({
				to: chan,
				message: msg
			});
		};;

	setTimeout( function() {
		data.bot.deleteMessage({
			channelID: chan,
			messageID: data.messageID
		});
	}, 100);

	if (challengers.includes(from)) {
		say(`🕑 <@${fromID}>, you already challenged for the Crown in the past 24 hours.`)
	} else {
		if (data.bot.servers[x.chan].members[fromID].roles.includes(king)) {
			say(`🕑 You can't challenge yourself, silly.`);
			return false;
		}

		say(`:crossed_swords: <@${fromID}> has challenged for the <@&${king}>`);
		challengers.push(from);
		// 24h timer - doesn't seem to work right
		setTimeout(function(){
			let i = challengers.indexOf(from);
			if (i>-1) challengers.splice(i, 1)
		}, 1000*60*60*24);
	}
});

module.exports.commands = [cmdChallenge, cmdDecrown, cmdCrown];
