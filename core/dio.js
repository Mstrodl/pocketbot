/* ----------------------------------------
	These are simplified versions of the
	larger discord.io functions, just so
	we have to write less crap.
 ---------------------------------------- */
var exports = module.exports = {};

exports.bot = '';
exports.say = function(bot=exports.bot,msg,c=chan) {
	bot.sendMessage({ to:c, message: msg });
}

exports.sendImage = function(bot=exports.bot,t,user,c=chan) {
	let emoji = t.replace(/:/g, "");
	let m = (user) ? '`@'+user+':`': null;
	if (emoji.startsWith('emoji/wen') || emoji.startsWith('emoji/dex') || emoji.startsWith('emoji/schatz')) {
		console.log('Uploading '+emoji+'.gif');
		bot.uploadFile({
			to: c,
			file: emoji + '.gif',
			filename: emoji + '.gif',
			message: m
		});
	} else {
		console.log('Uploading '+emoji+'.png');
		bot.uploadFile({
			to: c,
			file: emoji + '.png',
			filename: emoji + '.png',
			message: m
		});
	}
}

exports.del = function(bot=exports.bot,msg,c=chan,t=0) {
	setTimeout( function() {
		bot.deleteMessage({
			channelID: c,
			messageID: msg
		});
	}, t);
}

exports.edit = function(bot=exports.bot,msg,t,c=chan) {
	bot.editMessage({
		channelID: c,
		messageID: msg,
		message: t
	});
}
