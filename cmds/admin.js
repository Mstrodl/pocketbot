let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	dio		= require('../core/dio'),
	x 		= require('../core/vars');

let cmdSay = new command('admin', '!say', `Allows Masta to speak as Mastabot`, function(data) {
	if (data.userID === x.stealth) {
		dio.say(data.message.replace('!say ',''), data);
	}
});

let cmdNewBuild = new command('admin', 'new build live',``, function(data) {
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

let cmdCheck = new command('admin','!check',``,function(data) {
	let u = getUser(data.message),
		user = data.bot.servers[x.chan].members[u],
		uRoles = data.bot.servers[x.chan].members[data.userID].roles;

	if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) return false;

	if (!user) {
		dio.say(`🕑 Dont recognize member: \`${u}\``, data)
		return false;
	} else {
		dio.del(data.messageID,data);
		let online = (user.status === "online") ? ":large_blue_circle:" : ':white_circle:';
		let user = user.username;
		let nick = (user.nick != undefined) ? `\n aka ${user.nick}` : '';
		let disc = user.discriminator;

		let d = new Date(user['joined_at']);
		let join = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} @ ${d.getHours()}:${d.getMinutes()}`
		botSay(`${online} **${user} #${disc}** ${nick}
	**ID:** ${user.id}
	**Joined:** ${join}`, fromID);
	}
});

module.exports.commands = [cmdSay, cmdNewBuild, cmdCheck];
