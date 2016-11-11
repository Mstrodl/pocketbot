let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	dio		= require('../core/dio'),
	helpers	= require('../core/helpers'),
	x 		= require('../core/vars');

let cmdSay = new command('admin', '!say', `Allows Masta to speak as Mastabot`, function(data) {
	if (data.userID === x.stealth) dio.say(data.message.replace('!say ',''), data);
});

let cmdNewBuild = new command('admin', 'new build live',`Admin trigger to automatically bring up verification link`, function(data) {
	let uRoles = data.bot.servers[x.chan].members[data.userID].roles;
	if (uRoles.includes(x.admin)) {
		let v = [
			":white_check_mark: A new build means it's time to verify! http://toothandtailgame.com/verify",
			":white_check_mark: DO IT. JUST, DO IT: http://toothandtailgame.com/verify",
			":white_check_mark: Don't be a punk, verify that junk: http://toothandtailgame.com/verify",
			":white_check_mark: Verify the game or else you're lame. http://toothandtailgame.com/verify"
		];

		let n = Math.floor( Math.random()*4 );
		dio.say(v[n], data);
	}
});

let cmdCheck = new command('admin','!check',`Gets data about the user being checked`,function(data) {
	let u = helpers.getUser(data.message),
		user = data.bot.servers[x.chan].members[u],
		uRoles = data.bot.servers[x.chan].members[data.userID].roles;

	if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) return false;

	if (!user) {
		dio.say(`🕑 Dont recognize member: \`${u}\``, data)
		return false;
	} else {
		dio.del(data.messageID, data);
		let uname = user.username,
			online = (user.status === "online") ? ":large_blue_circle:" : ':white_circle:',
			nick = (user.nick != undefined) ? `\n aka ${user.nick}` : '',
			disc = user.discriminator;

		let d = new Date(user['joined_at']),
			join = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} @ ${d.getHours()}:${d.getMinutes()}`;

		dio.say(`${online} **${uname} #${disc}** ${nick}
	**ID:** ${user.id}
	**Joined:** ${join}`, data, data.userID);
	}
});

// works, albeit throwing errors. Only available to people with the pocketranger group. USE WITH CAUTION!!!
let cmdNoobify = new command('admin', '!noobify', `This will remove the member role.`, function(data) {
	let chan = data.channelID,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles;

	if (uRoles.includes(x.ranger) || uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		let k = data.args[1].slice(2, -1);
		if (k != undefined) {
			data.bot.removeFromRole({
				serverID: x.chan,
				userID: k,
				roleID: x.member
			}, function(err,resp) {
				logger.log("Error: " + err, logger.MESSAGE_TYPE.Error);
				logger.log("Response: " + resp, logger.MESSAGE_TYPE.Warn);
			});

			setTimeout(function() {
				data.bot.addToRole({
					serverID: x.chan,
					userID: k,
					roleID: x.noob
				}, function(err, resp) {
					if (err) logger.log(`${err} / ${resp}`, logger.MESSAGE_TYPE.Error);
				});
			}, 500);
		}
	}
});

module.exports.commands = [cmdSay, cmdNewBuild, cmdCheck, cmdNoobify];
