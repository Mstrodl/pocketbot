/* ----------------------------------------
	These are simplified versions of the
	larger discord.io functions, just so
	we have to write less crap.
 ---------------------------------------- */
var exports = module.exports = {};

exports.say = function(msg,data,chan=false) {
	let c = (chan) ? chan : data.channelID;
	data.bot.sendMessage({ to:c, message: msg });
}

exports.sendImage = function(t,user,data,chan=false) {
	let c = (chan) ? chan : data.channelID;
	let emoji = t.replace(/:/g, "");
	let m = (user) ? '`@'+user+':`': null;
	if (emoji.startsWith('emoji/wen') || emoji.startsWith('emoji/dex') || emoji.startsWith('emoji/schatz')) {
		console.log('Uploading '+emoji+'.gif');
		data.bot.uploadFile({
			to: c,
			file: emoji + '.gif',
			filename: emoji + '.gif',
			message: m
		});
	} else {
		console.log('Uploading '+emoji+'.png');
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

exports.edit = function(msgID,data,text,chan=false) {
	let c = (chan) ? chan : data.channelID;
	bot.editMessage({
		channelID: c,
		messageID: msgID,
		message: text
	});
}
