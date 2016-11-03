let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	TOKEN 	= require('../core/tokens'),
	dio		= require('../core/dio'),
	help	= require('../core/helpers'),
	x 		= require('../core/vars');

// =================
// Firebase for keys
// =================
let Fb = require("firebase");
let config = {
	apiKey: TOKEN.FBKEY,
	authDomain: "ltf-alpha-keys.firebaseapp.com",
	databaseURL: "https://ltf-alpha-keys.firebaseio.com",
	storageBucket: "ltf-alpha-keys.appspot.com",
	serviceAccount: {
		"type": "service_account",
		"project_id": "ltf-alpha-keys",
		"private_key_id": TOKEN.FBPKEYID,
		"private_key": TOKEN.FBPKEY,
		"client_email": "mastabot@ltf-alpha-keys.iam.gserviceaccount.com",
		"client_id": "108053915015859625755",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://accounts.google.com/o/oauth2/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mastabot%40ltf-alpha-keys.iam.gserviceaccount.com"
	}
};

let keyFire = Fb.initializeApp(config, "keydb");
let keys = keyFire.database().ref("key");
// =================

let cmdKey = new command('key', '!key', `Adds a vote to key a member/instakey by dev`, function(data) {
	let uRoles = data.bot.servers[x.chan].members[data.userID].roles,
		fromID = data.userID,
		from = data.user;

	let lucky = help.getUser(data.message);
	let memsnap = data.bot.servers[x.chan].members;

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

	// Check @user
	if (!memsnap[lucky]) {
		dio.del(data.messageID, data);
		dio.say("🕑 Hmm, that user doesn't exist. Did you @ them correctly?", data);
		return false;
	}

	// Already key'd?
	if ( memsnap[lucky].roles.includes(x.member) ) {
		dio.del(data.messageID, data);
		dio.say("🕑 This user is a member and should have a :key: already!", data);
		return false;
	}

	logger.log(`${from} is attempting to key userID: ${lucky}.\n
Server user: ${data.bot.servers[x.chan].members[lucky].username} \n
Memsnap: ${memsnap[lucky].username}`, logger.MESSAGE_TYPE.OK);

	// Grab last key in the list
	keys.orderByKey().limitToLast(1).once("value", function(snapshot) {
		let k = snapshot.key;
		let kk = snapshot.val();
		logger.log(`${from} voted!`, logger.MESSAGE_TYPE.Info);
		logger.log(memsnap[lucky], logger.MESSAGE_TYPE.Info);
		//console.log(k,kk,lucky);

		// Break if no keys left
		if (!kk) {
			dio.del(data.messageID, data);
			dio.say(`🕑 Welp. This is awkward <@${fromID}>. We need to refill the key list. Sorry <@${lucky}>, please standby!`, data);
			logger.log('Keys need to be refilled?', logger.MESSAGE_TYPE.Error)
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
					logger.log("user hasn't received vote before, adding 1 now.", logger.MESSAGE_TYPE.Info);
					newplayer.set( memsnap[lucky] ); // Set once if doesn't exist
					newplayer.child('vote').update(voter);
					votes = 1;
				} else {
					// Check for double vote
					logger.log("Checking votes", logger.MESSAGE_TYPE.Info);

					if ( x.hasOwnProperty('vote') ) { // If votes even exist
						logger.log("Checking double vote", logger.MESSAGE_TYPE.Info);
						if (x.vote.hasOwnProperty(fromID) ) {
							dio.say('🕑 You already voted for them.',fromID)
							return false;
						} else {
							logger.log('Has vote and not double', logger.MESSAGE_TYPE.OK);
							newplayer.child('vote').update(voter);
							votes = Object.keys( snap.val()[lucky].vote ).length+1
						}
					} else {
						logger.log('Doesnt have votes, adding', logger.MESSAGE_TYPE.OK);
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
			logger.log(`${from} has given a key.`, logger.MESSAGE_TYPE.OK)
		}
	}, function(err) {
		logger.log(err, logger.MESSAGE_TYPE.Error);
	});
});

module.exports.commands = [cmdKey];
