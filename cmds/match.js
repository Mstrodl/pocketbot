let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x		= require('../core/vars'),
	dio 	= require('../core/dio'),
	// Smaller, local array so I don't have to iterate through
	// every online user's role everytime...
	players = [];

let cmdReady = new command('matchmake', '!ready', `This marks a player as "Looking for a Game"`, function(data) {
	//regPlayer(fromID,'');
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		isReady = uRoles.includes(x.lfg);

	dio.del( data.messageID, data);

	// Check if user is a member (i.e. has key/game)
	if (!uRoles.includes(x.member) && !uRoles.includes(x.mod) && !uRoles.includes(x.admin)) {
		dio.say(`Sorry ${from}. You'll need the game first!`, data);
		return false;
	}
	// Check if player is already ready
	if (!isReady) {
		data.bot.addToRole({
			serverID: chan,
			userID: fromID,
			roleID: x.lfg
		}, function(err,resp) {
			if (err) {
				logger.log(resp, logger.MESSAGE_TYPE.Error);
				return false;
			}

			console.log(from+" is ready");
			if (players.length === 0) {
				dio.say(`:ok_hand: Awesome ${from}. I'll ping you when someone wants to play.`, data);
			} else if (players.length === 1) {
				dio.say(`Sweet. Hey <@${players[0]}>, <@${fromID}> wants to play. FIGHT! :crossed_swords:  Click to launch TnT: http://www.toothandtailgame.com/play`, data);
			} else {
				dio.say(`:ok_hand: Nice <@${fromID}>. There are a few people <@&${x.lfg}>, let's see who will play you...`, data);
			}
			players.push(fromID);
		});
	} else {
		let v = [
			`Yea ${from}, I'm aware you're ready. Chill, I'll let you know when someone else is. :stuck_out_tongue: `,
			`Hold your ponies ${from}, I know you're ready, let's wait for someone else. :thinking: `,
			`I know ${from}. Waiting for someone else to play...`,
			`Yea yea, now wait for someone else who wants to play, ${from}! :stuck_out_tongue: `,
			`You were already ready ${from}, but thanks for telling us. Again. :stuck_out_tongue_winking_eye: `
		];

		let n = Math.floor( Math.random()*4 );
		dio.say(v[n], data);
	}
});

let cmdUnready = new command('matchmake', '!unready', `This unmarks a player as "Looking for a Game"`, function(data) {
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID;

	if (players.includes(fromID)) {
		data.bot.removeFromRole({
			serverID: chan,
			userID: fromID,
			roleID: x.lfg
		}, function(err, resp) {
			if (err) {
				logger.log(resp, logger.MESSAGE_TYPE.Error);
				return false;
			}

			dio.say(`🕑 Okee dokes ${from}. Unmarking you from the list. :+1:`, data);

			let rem = players.indexOf(fromID);
			if (rem != -1) players.splice(rem, 1);
		});
	} else {
		dio.say(`🕑 Uh, you were never ready to begin with ${from}, but thanks for letting us know.`, data);
	}
});

let cmdVerify = new command('matchmake', '!verify', `This posts a Steam link which automatically verifies the TnT directory.`, function(data) {
	dio.say(":white_check_mark: Click here to verify your TnT files: http://toothandtailgame.com/verify", data);
});

module.exports.commands = [cmdReady, cmdUnready, cmdVerify];
