/* ----------------------------------------
	This file controls all the events fired
	off by presence changes from users, i.e.
	status, "Now playing...", and streams
 ---------------------------------------- */
var exports = module.exports = {};

let logger  = require('./logger'),
	dio		= require('./dio'),
	x 		= require('./vars'),
	userdata= require('./userdata');

exports.onChange = function(status, udata=null) {
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

				dio.say(`Removing ${from} from ready list due to disconnect.`, status, x.chan);
			});
		}
	}

	// Someone comes online
	if (status.state === "online") {
		let fromRoles = status.bot.servers[x.chan].members[fromID].roles;
		if ( fromRoles.length === 0 ) {
			// Stuff to tell new person
			let v = [
				`Welcome to the Pocketwatch chat, <@${fromID}>`,
				`Ahoy <@${fromID}>, welcome!`,
				`Glad to have you here, <@${fromID}>`,
				`What's up <@${fromID}>, welcome to the chat!`
			];

			let n = Math.floor( Math.random()*4 );
			dio.say(v[n], status, x.chan);
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

		//Dev greetings
		if ( fromRoles.includes(x.admin) ) {
				let greets = [
					`Master <@${fromID}> joins us once again`,
					`I could not find Glyde around so a generic greeting is all I have this time, <@${fromID}>`,
					`o/ <@${fromID}>`,
					`May your devness shine light upon us all, <@${fromID}>`,
					`One <@${fromID}> a day makes bugs go away. Welcome back!`,
					`It\s Butters, not Butter, <@${fromID}>!`,
					`Howdy, <@${fromID}>`,
					`<@${fromID}> Roses are red,\nViolets are blue, This amazing community\nWas waiting for you`,
					`Carpe diem, <@${fromID}>`,
					`Welcome back, <@${fromID}>`
				];

				if (fromID === x.schatz) {
					greets.push(
						`How's the fam, <@${fromID}>? :schatz:`
					);
				} else if (fromID === x.nguyen) {
					greets.push(
						`<@${fromID}> is here, commence the puns. :nguyen:`
					);
				} else if (fromID === x.dex) {
					greets.push(
						`Nasty girl <@${fromID}> has arrived! :dexter:`
					);
				}

				let n = Math.floor( Math.random()*greets.length );
				dio.say(greets[n], status, x.chan);
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

	//Create a userdata object if they don't have one
	if(udata && !udata.users[userID]){
		udata.users[userID] = {};
		udata.saveToFile('./data/users.json');
	}
	logger.log("User '" + from + "' is now '" + status.state + "'");
}
