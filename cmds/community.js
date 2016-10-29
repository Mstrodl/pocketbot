let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	wc 		= require('node-wolfram'),
	TOKEN 	= require('../core/tokens'),
	wolf 	= new wc(TOKEN.WOLFID),
	x 		= require('../core/vars');

function say(msg,d) {
	logger.log('Sending message...', logger.MESSAGE_TYPE.OK);
	d.bot.sendMessage({
		to: d.channelID,
		message: msg
	});
}

function del(id,d) {
	logger.log('Deleting previous message...', logger.MESSAGE_TYPE.OK);
	setTimeout( function() {
		d.bot.deleteMessage({
			channelID: d.channelID,
			messageID: d.messageID
		});
	}, 100);
}

let cmdAlpha = new command('community', '!alpha', `Gives information about joining the alpha`, function(data) {
	del(data.messageID, data);
	say(`:pencil: Learn more about the alpha in the <#${x.rules}> channel. :thumbsup:`,data);
});

let cmdControls = new command('community', '!controls', `Display game controls`, function(data) {
	say(":video_game: These are the current controls: http://www.toothandtailgame.com/images/big/ctrl.png",data);
});

let cmdBugs = new command('community', '!bugs', `Link to the Pocketwatch bug tracker`, function(data) {
	say(":beetle: Report bugs here: http://pwg.myjetbrains.com/youtrack/issues",data);
});

let cmdWiki = new command('community', '!wiki', `Link to Freakspot's TnT Wiki`, function(data) {
	say("Check out the wiki: http://toothandtailwiki.com/",data);
});

let cmdTourney = new command('community', '!tournament', `Link to Clash of Comrades website`, function(data) {
	say("For Tournament and game info, VODs, and other community events, check out http://www.clashofcomrades.com",data);
});

let cmdEmotes = new command('community', '!emotes', `Lists the available emotes`, function(data) {
	say("🕑 Current emotes available: `"+x.emotes.join(', ')+"`",data);
});

let cmdStream = new command('community', '!stream', `Links to the Pocketwatch stream with time till next broadcast`, function(data) {
	del(data.messageID,data);
	wolf.query("time till Friday 5pm EST", function(err, result) {
		let time = result.queryresult.pod[1].subpod[0].plaintext[0];
		say(`Check us out on Twitch @ http://www.twitch.tv/Pocketwatch (Fridays @ 5pm EST) \n The next stream will be in \`${time}\``,data);
		return false;
	});
});

let cmdBalance = new command('community', '!balance', `Links moderators to balance sheet`, function(data) {
	del(data.messageID,data);

	let uRoles = data.bot.servers[x.chan].members[data.userID].roles;
	if (uRoles.includes(x.mod) || uRoles.includes(x.admin)) {
		data.bot.sendMessage({
			to: data.userID,
			message: 'http://codepen.io/mastastealth/full/5701b12140c6d7f5bccf3b6a43faee08'
		});
	}
});

module.exports.commands = [cmdBalance, cmdStream, cmdEmotes, cmdTourney, cmdWiki, cmdBugs, cmdControls, cmdAlpha];
