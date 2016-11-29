/* ----------------------------------------
	This file controls all the events fired
	off by presence changes from users, i.e.
	status, "Now playing...", and streams
 ---------------------------------------- */
var exports = module.exports = {};

let logger  = require('./logger'),
	dio		= require('./dio'),
	x 		= require('./vars'),
	helper	= require('./helpers'),
	userdata= require('./userdata');
	helper	= require('./helpers')

// Timers
let sTimer = 0,
	nTimer = 0,
	dTimer = 0,
	fTimer = 0,
	mTimer = 0;

exports.onChange = function(status, udata=null) {
	let from = status.user,
		fromID = status.userID,
		game = status.game,
		timer = new Date().getTime();

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

		// D/c dev Timers
		switch (fromID) {
			case x.schatz:
				sTimer = new Date().getTime();
				break;
			case x.nguyen:
				nTimer = new Date().getTime();
				break;
			case x.dex:
				fTimer = new Date().getTime();
				break;
			case x.adam:
				dTimer = new Date().getTime();
				break;
			case x.stealth:
				mTimer = new Date().getTime();
				break;
		}
	}

	// Someone comes online
	if (status.state === "online") {
		// ! -- Update this to grab from Firebase data first, then check Discord
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

		// Challenge accepted, Masta
		if (fromRoles.includes(x.ranger)) {
			let oldState = udata.getProperty(fromID, 'status');
			if((oldState == 'offline' || oldState == null) && oldState != status.state){
				if (fromID === x.nooneImportant) {
					dio.say(`PocketBot reporting o7, Master J`, status, fromID);
				}
			}
		}

		//Dev greetings(and PR greetins, in debug mode)
		if ( fromRoles.includes(x.admin) ||( helper.isDebug() && fromRoles.includes(x.ranger)) ) {
			udata.getProperty(fromID, 'status').then( (oldState) => {
				if((oldState == 'offline' || oldState == null) && oldState != status.state){
					let greets = [
						`I could not find Glyde around so a generic greeting is all I have this time, ${from}`,
						`o/ ${from}`,
						`May your devness shine light upon us all, ${from}`,
						`One ${from} a day makes bugs go away. Welcome back!`,
						`It\'s Butters, not Butter, ${from}!`,
						`${from},\nRoses are red,\nViolets are blue,\n This amazing community\nWas waiting for you`,
					];

					if (fromID === x.schatz) {
						greets.push(
							`How's the fam, Master Schatz? ${x.emojis.schatz}`,
							`Ah! welcome back, Master Schatz! ${x.emojis.schatz}`,
							`Good of you to join us, Master Schatz. ${x.emojis.schatz}`,
							`${x.emojis.schatz} Master Schatz, you've returned.`
						);

						if ( (timer - sTimer) < 900000) return false;
					} else if (fromID === x.adam) {
						greets.push(
							`The pixel artist has returned. Welcome back Master Adam ${x.emojis.adam}.`,
							`Good of you to join us, Master Adam ${x.emojis.adam}.`,
							`${x.emojis.adam} Master DeGrandis, you've returned.`
						);

						if ( (timer - dTimer) < 900000) return false;
					} else if (fromID === x.nguyen) {
						greets.push(
							`Master Nguyen is here, commence the puns. ${x.emojis.nguyen}`,
							`Ah! welcome back, Master Nguyen! ${x.emojis.nguyen}`,
							`Good of you to join us, Master Nguyen. ${x.emojis.nguyen}`,
							`Master Nguyen, you've returned. ${x.emojis.nguyen}`
						);

						if ( (timer - nTimer) < 900000) return false;
					} else if (fromID === x.dex) {
						greets.push(
							`${x.emojis.dexter} Greetings Master Dexter, or should I say \`nasty girl\`? :speak_no_evil: `,
							`${x.emojis.dexter} Master Dexter, welcome back to your laboratory!`,
							`I see your afro remains dynamic, Master Dexter. ${x.emojis.dexter}`,
							`Back again I see, Master Dexter. ${x.emojis.dexter}`
						);

						if ( (timer - fTimer) < 900000) return false;
					} else if (fromID === x.stealth) {
						greets.push(
							`Ah! welcome back, Webmaster Stealth! ${x.emojis.masta}`,
							`Good of you to join us, Master Masta. ${x.emojis.masta}`,
							`Greetings, Mastastealth! ${x.emojis.masta}`
						);

						if ( (timer - mTimer) < 900000) return false;
					}

					let n = Math.floor( Math.random()*greets.length );
					dio.say(greets[n], status, x.chan);
				}
			});
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

	// Update user data on Firebase - Line 63 in userdata.js
	udata.setState( status.bot.servers[x.chan].members[fromID] );

	if ( helper.isDebug() ) logger.log("User '" + from + "' is now '" + status.state + "'");
}
