/* ----------------------------------------
	These are simplified versions of the
	larger discord.io functions, just so
	we have to write less crap.
 ---------------------------------------- */
var exports = module.exports = {};

exports.botSay = function(t,c=chan) {
	bot.sendMessage({ to:c, message: t });
}

exports.botSend = function(t,user,c=chan) {
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

exports.botDel = function(m,c=chan,t=0) {
	setTimeout( function() {
		bot.deleteMessage({
			channelID: c,
			messageID: m
		});
	}, t);
}

exports.botEdit = function(m,t,c=chan) {
	bot.editMessage({
		channelID: c,
		messageID: m,
		message: t
	});
}
