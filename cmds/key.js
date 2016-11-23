/* ----------------------------------------
	This file controls all the stuff related
	to the onboarding process of giving keys
	to new users via vote/admin powers.
 ---------------------------------------- */
require('dotenv').config({silent: true});

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	TOKEN 	= require('../core/tokens'),
	dio		= require('../core/dio'),
	help	= require('../core/helpers'),
	x 		= require('../core/vars'),
	cmdKey	= null;

function giveKey(data,lucky,key,mod=false) {
	logger.log(`Commence key giving to <@${lucky}>`, logger.MESSAGE_TYPE.Info);

	let whodidthat = (mod) ? "the Moderators' vote" : 'one of the Devs';
	// Direct message
	dio.say(`Hey <@${lucky}>, looks like you've been bestowed a key by ${whodidthat}! :key: \n
	Your Tooth and Tail steam key is: \`${key}\`! We hope you enjoy. :smile: Click here to activate it on steam: steam://open/activateproduct \n
	Please make sure to give us feedback in chat! You can mark yourself with \`!ready\`
	to let fellow players know you're up for a game in the #community channel.`,data,lucky);

	logger.log(`<@${lucky}> received ${key}`, logger.MESSAGE_TYPE.OK);

	// Completion message
	dio.say(`:tada: <@${lucky}> has now joined the alpha. :tada:`,data,x.chan);
	//regPlayer(lucky,"");

	// Remove from new
	data.bot.removeFromRole({
		serverID: x.chan,
		userID: lucky,
		roleID: x.noob
	}, function(err,resp) {
		if (err) logger.log(`${err} / ${resp}`, logger.MESSAGE_TYPE.Error);
	});

	// Add to members
	setTimeout(function() {
		data.bot.addToRole({
			serverID: x.chan,
			userID: lucky,
			roleID: x.member
		}, function(err, resp) {
			if (err) logger.log(`${err} / ${resp}`, logger.MESSAGE_TYPE.Error);
		});
	}, 500);
}

// If there is no FB token (localhost), ABORT!
if (!TOKEN.FBPKEYID()) {
	cmdKey = new command('key', '!key', `Adds a vote to key a member/instakey by dev`, function(data) {
		logger.log('Firebase tokens are busted.', logger.MESSAGE_TYPE.Warn);
		logger.log(TOKEN.FBPKEYID(), logger.MESSAGE_TYPE.Warn);
	});
} else {
	// =================
	// Firebase for keys
	// =================
	let Fb = require("firebase");
	let config = {
		apiKey: TOKEN.FBKEY(),
		authDomain: "ltf-alpha-keys.firebaseapp.com",
		databaseURL: "https://ltf-alpha-keys.firebaseio.com",
		storageBucket: "ltf-alpha-keys.appspot.com",
		serviceAccount: {
			"type": "service_account",
			"project_id": "ltf-alpha-keys",
			"private_key_id": TOKEN.FBPKEYID(),
			"private_key": TOKEN.FBPKEY(),
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

	cmdKey = new command('key', '!key', `Adds a vote to key a member/instakey by dev`, function(data) {
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
			logger.log(memsnap[lucky].username, logger.MESSAGE_TYPE.Info);
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
					let newplayer = data.db.soldiers.child(lucky);
					let l = snap.val()[lucky];
					let voter = {};
					voter[fromID] = true;
					//console.log(newplayer, x, voter);

					if (!l) {
						logger.log("user hasn't received vote before, adding 1 now.", logger.MESSAGE_TYPE.Info);
						newplayer.set( memsnap[lucky] ); // Set once if doesn't exist
						newplayer.child('vote').update(voter);
						votes = 1;
					} else {
						// Check for double vote
						logger.log("Checking votes", logger.MESSAGE_TYPE.Info);

						if ( l.hasOwnProperty('vote') ) { // If votes even exist
							logger.log("Checking double vote", logger.MESSAGE_TYPE.Info);
							if (l.vote.hasOwnProperty(fromID) ) {
								dio.say('🕑 You already voted for them.',data,fromID)
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

					dio.say(`:key: ${from} has voted to key ${memsnap[lucky].username}, ${votes} of 4!`, data, x.history)
					if (votes === 5)  {
						dio.say(`:tada: <@${lucky}> has been voted to receive a key.`, data, x.history);
						newplayer.set( memsnap[lucky] );
						for (let code in kk) {
							// Removes key from Firebase
							keys.child(code).set({});
							giveKey(data,lucky,kk[code].key,true);
						}
					}
				}, function(err) {
					logger.log(err, logger.MESSAGE_TYPE.Error);
				});

				return false;
			}

			// Actual Key Giving
			for (let code in kk) {
				// Removes key from Firebase
				keys.child(code).set({});
				giveKey(data,lucky,kk[code].key);
				logger.log(`${from} has given a key.`, logger.MESSAGE_TYPE.OK)
			}
		}, function(err) {
			logger.log(err, logger.MESSAGE_TYPE.Error);
		});
	});
}

module.exports.commands = [cmdKey];
