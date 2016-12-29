var logger = require('./logger');
var embed = require('./embed');

/* ----------------------------------------
	These are simplified versions of the
	larger discord.io functions, just so
	we have to write less crap.
 ---------------------------------------- */
var exports = module.exports = {};

exports.say = function(msg,data,chan=false) {
	let c = (chan) ? chan : data.channelID;

	for(let i=0; i < Math.ceil(msg.length / 2000); i++) {
		let newmsg = msg.substring( i*2000, i+1999 );
		data.bot.sendMessage({
			to:c,
			message: newmsg
		});
	}
}

exports.sendEmbed = function(embedObj, data, chan=false){
	let c = (chan) ? chan : data.channelID;
	data.bot.sendMessage({
		to: c,
		embed: embedObj
	}, function(err, res){
		if(err){
			logger.log(err, logger.MESSAGE_TYPE.Error);
		}
	});
}

exports.sendImage = function(t,user,data,chan=false) {
	let c = (chan) ? chan : data.channelID;
	let emoji = t.replace(/:/g, "").replace();
	let m = (user) ? '`@'+user+':`': null;
	if (emoji.startsWith('emoji/wen') || emoji.startsWith('emoji/dex') || emoji.startsWith('emoji/schatz') || emoji.startsWith('emoji/db')) {
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
