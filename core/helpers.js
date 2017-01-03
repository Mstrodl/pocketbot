/* ----------------------------------------
	These are simple helper functions to do
	some quick task/calculation
---------------------------------------- */
let dio = require('../core/dio'),
	x	= require('../core/vars');
	embed = require('../core/embed');
// ! -- Feel free to improve any of these functions

const DEFAULT_AVATAR_URL = 'https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png';

module.exports.Embed = embed.Embed;
module.exports.EmbedItem = embed.EmbedItem;

// Debug function
module.exports.isDebug = function() {
	if ((process.argv.includes("--debug")) || (process.argv.includes("--d"))) {
		return true;
	}
	return false;
}

//Lazyness has no limits
module.exports.isHeroku = function(){
	return process.env.ISHEROKU;
}

// Count function
module.exports.getCount = function(arr, val) {
	let i, j, count = 0;
	for (i=0,j=arr.length;i<j;i++) {
		(arr[i] === val) && count++;
	}
	return count;
}

// Command timer
module.exports.popCommand = function(arr) {
	if (arr.length>0)  arr.shift();
	//console.log(command);
	setTimeout( function() {
		module.exports.popCommand(arr);
	},4000);
}

// Gets player ID out of any string
module.exports.getUser = function(txt) {
	if (txt.match(/\b\d{10,}\b/g)) {
		return txt.match(/\b\d{10,}\b/g)[0];
	} else {
		return undefined;
	}
}

// Countdown message
// m = message ID
// t = message text
// c = channelID
// n = steps?
// b - Bot
module.exports.countdownMessage = function(m,t,c,n,b) {
	if (n > 0) {
		//console.log('Counting Down', n, m);
		setTimeout(function() {
			if (t.includes("🕗")) { // 8 to 10
				dio.edit(m,b,t.replace("🕗","🕙"),c);
				module.exports.countdownMessage(m,t.replace("🕗","🕙"),c,n-1,b);
			}
			else if (t.includes("🕕")) { // 6 to 8
				dio.edit(m,b,t.replace("🕕","🕗"),c);
				module.exports.countdownMessage(m,t.replace("🕕","🕗"),c,n-1,b);
			}
			else if (t.includes("🕓")) { // 4 to 6
				dio.edit(m,b,t.replace("🕓","🕕"),c);
				module.exports.countdownMessage(m,t.replace("🕓","🕕"),c,n-1,b);
			}
			else if (t.includes("🕑")) { // 2 to 4
				dio.edit(m,b,t.replace("🕑","🕓"),c);
				module.exports.countdownMessage(m,t.replace("🕑","🕓"),c,n-1,b);
			} else { //1 0 to 12
				dio.edit(m,b,t.replace("🕙","💥"),c);
				module.exports.countdownMessage(m,t.replace("🕙","💥"),c,0,b);
			}
		}, 2000);
	} else {
		//console.log('Deleting.');
		dio.del(m,{bot: b},c,1000);
	}
}

// Message argument parser
module.exports.getArgs = function(message) {
	//Split the input by spaces
	var word_array = message.split(" ");
	var args_array = [];
	var temp_arg = "";

	for(var key = 0; key < word_array.length; key++) {
		//If an element start with quotes, it's the start of a string'
		if(word_array[key][0] == "\"" || word_array[key][0] == "\'") {
			var found_end = false;

			//Search for the end of the string and also inceremnt the key counter
			for(var j = key; j < word_array.length && !found_end; j++, key++) {
				//Add the word to the argument
				temp_arg += word_array[j] + " ";

				//If there's another quote at the end, we've reached the end of the argument
				if(word_array[j][word_array[j].length - 1] == "\"" || word_array[j][word_array[j].length - 1] == "\'") {
					found_end = true;
				}
			}
			//Add the final argument to the argument array
			args_array.push(temp_arg.substring(1, temp_arg.length-2));
		} else {
			args_array.push(word_array[key]);
		}
	}

	return args_array;
}

//Find the ID of a user given the client and the username
module.exports.getIDFromName = function(client, name){
    for(var key in client.users){
        if(client.users[key].username == name){
            return key;
        }
    }
    return null;
}

//Checks if the current channel is x.playground
module.exports.isBPG = function(chan) {
	if (chan.channelID != x.playground) {
		return false;
	} else {
		return true;
	}
}

//Get the DM channel for a given user ID
module.exports.getDMChannel = function(client, userID){
	for(var k in client.directMessages){
		if(client.directMessages[k].recipient.id == userID){
			return client.directMessages[k].id;
		}
	}
	return null;
}

module.exports.collapseWhitespace = function(s){
	//Remove any whitespace around the string
	s = s.trim();
	//Run some regex I found on stackoverflow which presumably does what I need it to be
	s = s.replace(/  +/g, ' ');
	return s;
}
//Gets a user's roles given the user ID
module.exports.getUserRoles = function(client , userID, serverID = x.chan){
	return client.servers[serverID].members[userID].roles;
}

//Get a user's nickname from a member list given the ID
module.exports.getNickFromId = function(id, client){
	return (client.servers[x.chan].members[id].nick ? client.servers[x.chan].members[id].nick : client.users[id].username);
}

//Get a user's avatar URL given their ID, returns a default avatar if one cannot be found
module.exports.getAvatarURLFromId = function(id, client, callback){
	//I'm sorry for this hack
	client.createDMChannel(id, function(err, res){
		if(err || !res || !res.recipient.avatar){
			res = DEFAULT_AVATAR_URL;
		}else{
			res = `https://cdn.discordapp.com/avatars/${id}/${res.recipient.avatar}.png`;
		}	
		callback(err, res);
	});
}

module.exports.getChannelNameFromId = function(id, client){
	return client.channels[id].name;
}

module.exports.vars = x;
