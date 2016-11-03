/* ----------------------------------------
	This file controls all the events fired
	off by presence changes from users, i.e.
	status, "Now playing...", and streams
 ---------------------------------------- */
var exports = module.exports = {};

let logger  = require('./logger'),
	dio		= require('./dio'),
	x 		= require('./vars');

exports.onChange = function(status) {
	let from = status.user,
		fromID = status.userID,
		game = status.game;

	// Someone goes offline
	if (status.state === "offline") {
		// Check if they are on ready list
		if (status.bot.servers[x.chan].members[fromID].roles.includes(x.lfg)) {
			status.bot.removeFromRole({
				serverID: x.chan,
				userID: fromID,
				roleID: x.lfg
			}, function(err, resp) {
				if (err) {
					logger.log(resp, logger.MESSAGE_TYPE.Error);
					return false;
				}

				dio.say(`Removing ${from} from ready list due to disconnect.`, status);
			});
		}
	}

	// Someone comes online
	if (status.state === "online") {
		if ( status.bot.servers[x.chan].members[fromID].roles.length === 0 ) {
			// Stuff to tell new person
			let v = [
				`Welcome to the Pocketwatch chat, <@${fromID}>`,
				`Ahoy <@${fromID}>, welcome!`,
				`Glad to have you here, <@${fromID}>`,
				`What's up <@${fromID}>, welcome to the chat!`
			];

			let n = Math.floor( Math.random()*4 );
			dio.say(v[n], status);
			status.bot.addToRole({
				serverID: x.chan,
				userID: fromID,
				roleID: x.noob
			});

			dio.say(`Glad you found the Pocketwatch community, we hope you enjoy your stay. :) \n
Please checkout the <#${x.rules}> channel for some basic community rules and info on how to get into the alpha. \n
The developers hang out in the chat all the time, so feel free to say hi, ask questions, and tune in to our streams on Fridays @ 5PM EST! \n
For a list of my commands, feel free to type \`!help\` in any channel or in a private message. :thumbsup:`,status,fromID);
		}
	}

	// A member starts a stream
	if (game != null && game.type === 1) {
		if (!status.bot.servers[x.chan].members[fromID].roles.includes(x.member)) return false;

		dio.say(`:movie_camera: <@${fromID}> is streaming! \n ${game.name} @ <${game.url}>!`, status);
		// ! -- want to figure out a way to add a timer so
		// people don't spam up channel on accident
		// streamer = fromID;
		// setTimeout(function() {
		// 	streamer = '';
		// },6000*10);
	}
}
