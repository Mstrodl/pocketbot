/* ----------------------------------------
	This file contains most of the general
	commands (formerly in Mastabot) that the
	public community uses.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	moment 	= require('moment'),
	TOKEN 	= require('../core/tokens'),
	dio		= require('../core/dio'),
	x 		= require('../core/vars');

let cmdAlpha = new command('community', '!alpha', `Gives information about joining the alpha`, function(data) {
	dio.del(data.messageID, data);
	dio.say(`:pencil: Learn more about the alpha in the <#${x.rules}> channel. :thumbsup:`,data);
});

let cmdControls = new command('community', '!controls', `Display game controls`, function(data) {
	dio.say(":video_game: These are the current controls: http://www.toothandtailgame.com/images/big/ctrl.png",data);
});

let cmdBugs = new command('community', '!bugs', `Link to the troubleshooting channel`, function(data) {
	dio.say(":beetle: Report bugs here: <#134810918113509376>",data);
});

let cmdWiki = new command('community', '!wiki', `Link to Freakspot's TnT Wiki`, function(data) {
	dio.say("Check out the wiki: http://toothandtailwiki.com/",data);
});

let cmdTourney = new command('community', '!tournament', `Link to the Clash of Comrades website`, function(data) {
	dio.say("For Tournament and game info, VODs, and other community events, check out http://www.clashofcomrades.com",data);
});

let cmdEmotes = new command('community', '!emotes', `Lists the available emotes`, function(data) {
	dio.say("🕑 Current emotes available: `"+x.emotes.join(', ')+"`",data);
});

let cmdBalance = new command('community', '!balance', `Links moderators to balance sheet`, function(data) {
	dio.del(data.messageID,data);

	let uRoles = data.bot.servers[x.chan].members[data.userID].roles;
	if (uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		data.bot.sendMessage({
			to: data.userID,
			message: 'http://codepen.io/mastastealth/full/5701b12140c6d7f5bccf3b6a43faee08'
		});
	}
});

let cmdKillDancer = new command('community', '!killdancer', `Kills any dancers Hox posts`, function(data) {
	let uRoles = data.bot.servers[x.chan].members[data.userID].roles;
	if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) return false;

	if (data.dance != "") {
		logger.log(data.dance, logger.MESSAGE_TYPE.Info);
		dio.del(data.messageID, data);
		dio.del(data.dance, data);

		let weapon = '';
		let x = Math.floor(Math.random() * (4 - 1)) + 1;
		switch (x) {
			case 1:
				weapon = ":knife::astonished:";
				break;
			case 2:
				weapon = ":scream::gun:";
				break;
			case 3:
				weapon = ":dagger::astonished: ";
				break;
			case 4:
				weapon = ":bomb: :skull: ";
				break;
		}

		dio.say(`${weapon}`, data);
	}
});

let cmd8Ball = new command('community', '!8ball', `Asks the 8ball a question`, function(data) {

	let x = Math.floor(Math.random()*(20)-1),
		answer = [
			"It is certain", "It is decidedly so", "Without a doubt", "Yes, definitely",
			"As I see it, yes", "Most likely", "Outlook good", "Yes",
			"Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now",
			"Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no",
			"My sources say no", "Outlook not so good", "Very doubtful"
		];

	dio.say(`:8ball: says _"${answer[x]}"_`,data);
});

// ! -- Gotta adjust command structure for this one?
// let cmdEmoji = new command('community', ':', `Replaces text with an emoji`, function(data) {
// 	let text = data.message;
//
// 	switch(text) {
// 		case ":yourmother:":
// 			text = ':yomama:'
// 			break;
// 		case ":patch17:":
// 			text = ':schatzmeteor:'
// 			break;
// 	}
//
// 	if (x.emotes.includes(text)) {
// 		dio.del(data.messageID,data.channelID);
// 		dio.sendImage('emoji/'+text,data.user,data.channelID);
// 	}
// });

module.exports.commands = [cmdBalance, cmdEmotes, cmdTourney, cmdWiki, cmdBugs, cmdControls, cmdAlpha, cmdKillDancer, cmd8Ball];
