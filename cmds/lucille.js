/* ----------------------------------------
	This is the port of AlexPanda's Lucille
	bot, which posts in #community whenever
	certain devs tweet.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	helpers = require('../core/helpers'),
	TOKEN 	= require('../core/tokens'),
	x 		= require('../core/vars'),
	dio 	= require('../core/dio'),
	T		= (helpers.isHeroku() ? require('twit') : null);

// These go somewhere, not sure where, definitely not here most likely.
	let twitter = (helpers.isHeroku() ? new T({
		consumer_key:         TOKEN.TWITKEY,
		consumer_secret:      TOKEN.TWITTOKEN,
		// Frickin twitter needs so much crap
		access_token:         TOKEN.TWITATOKEN,
		access_token_secret:  TOKEN.TWITSECRET,
	}) : null),
		// Needs IDs, use http://gettwitterid.com
		watchList = [
			'19382657', //@andyschatz
			'3007775843', //@AdamdeGrandis
			'358443628', //@pixelatedpost
			'111136741', //@PocketwatchG
			'834635096', //@PowerUpAudio
			'718565399944634372', //@ClashOfComrades
			'3271155122' //@ToothAndTail
			//,'14423000' //@brianfranco
		],
		stream = (helpers.isHeroku() ? twitter.stream('statuses/filter', { follow: watchList }) : null),
		lucilleBot = false,
		lucillePersona = false,
		lucilleTweet = false;
}

function twitterList(watchList){
	let x = "The Current Twitter Accounts Being Tracked Are: \n "
			for (i=0; i<watchList.length;i++){
			x += '@'+watchList[i]+'\n'
		};
	return x
};

// Commenting out for now, since watchList is full of numbers now...
// let cmdTwitter = new command('lucille', '!twitter', 'Twitter List', function(data){
// 	dio.say( twitterList(watchList), data );
// });

let cmdTweet = new command('lucille', '!tweet', 'Performs a tweet, ignored by users', function(data){
	dio.del(data.messageID, data);
	//console.log(lucilleTweet);
	if (lucilleTweet) {
		let lT = lucilleTweet,
			face = '';

		switch(lT.uid) {
			case '19382657':
				face = x.emojis.schatz;
				break;
			case '358443628':
				face = x.emojis.nguyen;
				break;
			case '3007775843':
				face = x.emojis.adam;
				break;
			case '718565399944634372':
				face = x.emojis.wolf;
				break;
		}

		dio.say( `**${face} @${lT.user} just tweeted**: \n ${lT.tweet} \n \n <http://twitter.com/${lT.user}/status/${lT.id}>`, data, x.chan);
		lucilleTweet = false;
	}
});

let cmdLucy = new command('lucille', '!lucille', 'Activates Lucille', function(data){
	dio.del(data.messageID, data);
	logger.log('Lucille Activated.', 'OK');
	lucilleBot = data.bot;
});

//On Twitter Message
if(helpers.isHeroku()){
	stream.on('tweet', function(tweet) {
		//console.log(tweet);
		//If Tracked User
		if ( watchList.includes(tweet.user.id_str) ) {
			if (!lucilleBot) return false;
			lucilleTweet = {
				user: tweet.user.screen_name,
				uid: tweet.user.id,
				tweet: tweet.text,
				id: tweet.id_str
			}
			// Work around!
			dio.say( `!tweet`, { bot: lucilleBot, channelID: x.testing } );
		}
	});
}

module.exports.commands = [cmdLucy, cmdTweet];
