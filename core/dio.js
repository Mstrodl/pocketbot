var logger = require('./logger');

/* ----------------------------------------
	These are simplified versions of the
	larger discord.io functions, just so
	we have to write less crap.
 ---------------------------------------- */
var exports = module.exports = {};

exports.say = function(msg,data,chan=false) {
	let c = (chan) ? chan : data.channelID;

	for(var i = 0; i < Math.floor(msg.length / 2000); i++)
	{
		data.bot.sendMessage({ to:c, message: msg.substring(i*2000, Math.min(msg.length - i*2000, (i+1)*2000-1)) });
	}
}

exports.sendImage = function(t,user,data,chan=false) {
	let c = (chan) ? chan : data.channelID;
	let emoji = t.replace(/:/g, "");
	let m = (user) ? '`@'+user+':`': null;
	if (emoji.startsWith('emoji/wen') || emoji.startsWith('emoji/dex') || emoji.startsWith('emoji/schatz')) {
		logger.log('Uploading '+emoji+'.gif', logger.MESSAGE_TYPE.OK);
		data.bot.uploadFile({
			to: c,
			file: emoji + '.gif',
			filename: emoji + '.gif',
			message: m
		});
	} else {
		logger.log('Uploading '+emoji+'.png', logger.MESSAGE_TYPE.OK);
		data.bot.uploadFile({
			to: c,
			file: emoji + '.png',
			filename: emoji + '.png',
			message: m
		});
	}
}

exports.del = function(msg,data,chan=false,t=100) {
	let c = (chan) ? chan : data.channelID;
	setTimeout( function() {
		data.bot.deleteMessage({
			channelID: c,
			messageID: msg
		});
	}, t);
}

exports.edit = function(msgID,bot,text,chan=false) {
	let c = (chan) ? chan : bot.channelID;
	bot.editMessage({
		channelID: c,
		messageID: msgID,
		message: text
	});
}
