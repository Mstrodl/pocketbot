let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	TOKEN 	= require('../core/tokens'),
	dio		= require('../core/dio'),
	help	= require('../core/helpers'),
	x 		= require('../core/vars');

// =================
// Firebase for keys
// =================
let config = {
	apiKey: FBKEY,
	authDomain: "ltf-alpha-keys.firebaseapp.com",
	databaseURL: "https://ltf-alpha-keys.firebaseio.com",
	storageBucket: "ltf-alpha-keys.appspot.com",
	messagingSenderId: "255743574934"
};

Fb.initializeApp(config);
let keys = Fb.database().ref("key");
// =================

let cmdKey = new command('key', '!key', `Adds a vote to key a member/instakey by dev`, function(data) {
	let uRoles = data.bot.servers[x.chan].members[data.userID].roles,
		fromID = data.userID,
		from = data.user;
	//if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) return false;

	let lucky = help.getUser(data.message);
	let memsnap = data.bot.servers[x.chan].members;
	console.log(`${from} is attempting to key userID: ${lucky}.\n
Server user: ${data.bot.servers[x.chan].members[lucky]} \n
Memsnap: ${memsnap[lucky]}`);

	// Grab last key in the list
	keys.orderByKey().limitToLast(1).once("value", function(snapshot) {
		let k = snapshot.key;
		let kk = snapshot.val();
		console.log(`${from} voted!`);
		console.log(memsnap[lucky]);
		//console.log(k,kk,lucky);

		if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) {
			dio.del(data.messageID, data);
			let v = [
				"🕑 Nice try sneaky pants.",
				"🕑 Nope.",
				"🕑 You are neither an admin, nor mod, be gone, peasant.`",
				"🕑 I'll just ignore that..."
			];

			let n = Math.floor( Math.random()*4 );
			dio.say(v[n], data);
			return false;
		}

		// Break if no keys left
		if (!kk) {
			dio.del(data.messageID, data);
			dio.say(`🕑 Welp. This is awkward <@${fromID}>. We need to refill the key list. Sorry <@${lucky}>, please standby!`, data);
			return false;
		}

		// Check @user
		if (!memsnap[lucky]) {
			dio.del(data.messageID, data);
			dio.say("🕑 Hmm, that user doesn't exist. Did you @ them correctly?", data);
			return false;
		}

		// Already key'd?
		if ( memsnap[lucky].roles.includes(member) ) {
			dio.del(data.messageID, data);
			dio.say("🕑 This user is a member and should have a :key: already!", data);
			return false;
		}

		// Mods Vote
		if (uRoles.includes(x.mod)) {
			let votes = 0;
			// Register player and add vote
			data.db.soldiers.once("value", function(snap) {
				dio.del(data.messageID, data);
				let newplayer = soldiers.child(lucky);
				let x = snap.val()[lucky];
				let voter = {};
				voter[fromID] = true;

				if (!x) {
					console.log("user hasn't received vote before, adding 1 now.");
					newplayer.set( memsnap[lucky] ); // Set once if doesn't exist
					newplayer.child('vote').update(voter);
					votes = 1;
				} else {
					// Check for double vote
					console.log("Checking votes");

					if ( x.hasOwnProperty('vote') ) { // If votes even exist
						console.log("Checking double vote");
						if (x.vote.hasOwnProperty(fromID) ) {
							dio.say('🕑 You already voted for them.',fromID)
							return false;
						} else {
							console.log('Has vote and not double');
							newplayer.child('vote').update(voter);
							votes = Object.keys( snap.val()[lucky].vote ).length+1
						}
					} else {
						console.log('Doesnt have votes, adding');
						newplayer.child('vote').update(voter);
						votes = 1;
					}
				}

				dio.say(`:key: ${from} has voted to key ${memsnap[lucky].username}, ${votes} of 4!`, x.history)
				if (votes === 4)  {
					dio.say(`:tada: <@${lucky}> has been voted to receive a key.`, x.history);
					newplayer.set( memsnap[lucky] );
					for (let code in kk) {
						// Removes key from Firebase
						keys.child(code).set({});
						giveKey(lucky,kk[code].key,true);
					}
				}
			});

			return false;
		}

		// Actual Key Giving
		for (let code in kk) {
			// Removes key from Firebase
			keys.child(code).set({});
			giveKey(lucky,kk[code].key);
		}
	});
});

module.exports.commands = [cmdKey];
