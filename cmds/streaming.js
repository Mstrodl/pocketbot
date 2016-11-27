/* ----------------------------------------
	This file controls all the stuff related
	to Twitch streams.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	moment 	= require('moment'),
	req 	= require('request'),
	TOKEN 	= require('../core/tokens'),
	dio		= require('../core/dio'),
	x 		= require('../core/vars');

let cmdStream = new command('streaming', '!stream', `Links to the Pocketwatch stream with time till next broadcast`, function(data) {
		console.log('!stream');
		dio.del(data.messageID,data);
		const day = 5; // Friday
		let time = 0;

		if (moment().isoWeekday() < day) {
			// If today is less than day needed -> "in x days"
			time = moment( moment().isoWeekday(day).startOf('hour').hour(17) ).fromNow();
		} else if (moment().isoWeekday() > day) {
			// If today is Saturday, add a week
			time = moment( moment().add(1, 'weeks').isoWeekday(day).startOf('hour').hour(17) ).fromNow();
		} else if (moment().isoWeekday() === day) {
			// If today is friday -> "in x hours, y minutes"
			time = moment( moment().startOf('hour').hour(17) ).fromNow();
		}

		dio.say(`Check us out on Twitch @ http://www.twitch.tv/Pocketwatch (Fridays @ 5pm EST) \n The next stream will be \`${time}\``,data);
});

let cmdTwitch = new command('streaming', '!streams', `Checks Twitch for anyone streaming TnT`, (data) => {
	dio.say('🕑 Let me see if I can find any...',data);
	req({
		url: "https://api.twitch.tv/kraken/streams?game=Tooth and Tail",
		headers: { "Client-ID": TOKEN.TWITCHID }
	}, (err, resp, body) => {
		if (err) {
			logger.log(err, logger.MESSAGE_TYPE.Error);
			dio.say('🕑 I had trouble with that request. :sob:',data);
		} else {
			let streams = JSON.parse(body);
			console.log(streams)
			if (streams._total === 0) {
				let v = [
				`Doesn't look like anyone is streaming at the moment.`,
				`No active streamers found.`,
				`I guess everyone hates this game, since no one is streaming it atm. :sob:`,
				`No one is streaming right now, why don't you start one? :D`,
				`Your stream princess is in another castle. :confused:`
				],
				n = Math.floor( Math.random()*4 );

				dio.say(v[n], data);
			} else if (streams._total === 1) {
				console.log(streams.streams[0].channel)
				let streamer = streams.streams[0].channel,
					v = [
					`Oh hey, looks like ${streamer.display_name} is streaming over at: ${streamer.url}`,
					`${streamer.display_name} is streaming over right now! Check it out: ${streamer.url}`,
					`I found one streamer, ${streamer.display_name}, streaming at: ${streamer.url}`,
					`Got one! ${streamer.display_name} is streaming: ${streamer.url}`,
					`Apparently some noob named ${streamer.display_name} is streaming atm: ${streamer.url}`
					],
					n = Math.floor( Math.random()*4 );

				dio.say(v[n], data);
			} else if (streams._total > 1) {
				let streamers = [];

				for (let i=0,  s=streams.streams.length; i<s; i++) {
					streamers.push(`:movie_camera: **${streams.streams[i].channel.display_name}** | <${streams.streams[i].channel.url}>`);
				}

				dio.say(`A few people are streaming! \n${streamers.join(' \n')}`, data);
			}
		}
	});
});

let cmdStreamers = new command('streaming', '!streamers', `Lists some of the known TnT community streamers`, (data) => {
	dio.say(`You can find a list of streamers over here: <http://www.clashofcomrades.com/events>`, data);
});


module.exports.commands = [cmdStream, cmdTwitch, cmdStreamers];
