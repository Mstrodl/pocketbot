let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	helpers = require('../core/helpers'),
	T		= require('twit');

//These go somewhere, not sure where, definitely not here most likely.
	let T = new Twit({
		consumer_key:         TOKEN.KEY_TCONSUMER,
		consumer_secret:      TOKEN.KEY_TCONSUMER_SEC,
		access_token:         TOKEN.KEY_TACCESS,
		access_token_secret:   TOKEN.KEY_TACCESS_SEC,
	}),
		stream = T.stream('user');
		watchList = [
			'',
		];

let cmd_twitter = new command('lucille', '!twitter', 'Twitter List', function(data){
	data.bot.sendMessage({
		to		: data.channelID,
		message	: twitterList(watchList)
	})
};

function twitterList(watchList){
	let x = "The Current Twitter Accounts Being Tracked Are: \n "
			for (i=0; i<watchList.length;i++){
			x += '@'+watchList[i]+'\n'
		};
	return x
};

function BotPostSelf(msg, tweetID, urid){
	return ('@'+tweetID + " just tweeted: \'"+ msg + "\' \n \n Link to Status: twitter.com/"+tweetID+"/status/"+id)
});


module.exports.commands = [cmd_twitter];
