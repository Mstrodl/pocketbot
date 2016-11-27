/* ----------------------------------------
	This file controls all the stuff related
	to matchmaking within the chat.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x		= require('../core/vars'),
	dio 	= require('../core/dio');

let cmdReady = new command('matchmake', '!ready', `This marks a player as **'Looking for a Game'**`, function(data) {
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
			serverID: x.chan,
			userID: fromID,
			roleID: x.lfg
		}, function(err,resp) {
			if (err) {
				logger.log(err + ' / ' + resp, logger.MESSAGE_TYPE.Error);
				return false;
			}

			dio.say(`:ok_hand: Nice <@${fromID}>. I'll see if anyone is <@&${x.lfg}>. Get ready to FIGHT! :crossed_swords:  Click to launch TnT: http://www.toothandtailgame.com/play`, data);
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

let cmdUnready = new command('matchmake', '!unready', `This unmarks a player as **'Looking for a Game'**`, function(data) {
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID;

	dio.del( data.messageID, data);
	if (data.bot.servers[x.chan].members[fromID].roles.includes(x.lfg)) {
		data.bot.removeFromRole({
			serverID: x.chan,
			userID: fromID,
			roleID: x.lfg
		}, function(err, resp) {
			if (err) {
				logger.log(resp, logger.MESSAGE_TYPE.Error);
				return false;
			}

			dio.say(`🕑 Okee dokes ${from}. Unmarking you from the list. :+1:`, data);
		});
	} else {
		dio.say(`🕑 Uh, you were never ready to begin with ${from}, but thanks for letting us know.`, data);
	}
});

let cmdVerify = new command('matchmake', '!verify', `This posts a Steam link which automatically verifies the TnT directory`, function(data) {
	dio.say(":white_check_mark: Click here to verify your TnT files: http://toothandtailgame.com/verify", data);
});

module.exports.commands = [cmdReady, cmdUnready, cmdVerify];
