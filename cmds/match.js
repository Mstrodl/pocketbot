/* ----------------------------------------
	This file controls all the stuff related
	to matchmaking within the chat.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x		= require('../core/vars'),
	dio 	= require('../core/dio');

let cmdReady = new command('matchmake', '!ready', `This marks a player as **'Looking for a Game'**`, function(data) {
	//regPlayer(fromID,'');
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		isReady = uRoles.includes(x.lfg);

	dio.del( data.messageID, data);

	// Check if user is a member (i.e. has key/game)
	if (!uRoles.includes(x.member) && !uRoles.includes(x.mod) && !uRoles.includes(x.admin)) {
		dio.say(`Sorry ${from}. You'll need the game first!`, data);
		return false;
	}
	// Check if player is already ready
	if (!isReady) {
		data.bot.addToRole({
			serverID: x.chan,
			userID: fromID,
			roleID: x.lfg
		}, function(err,resp) {
			if (err) {
				logger.log(err + ' / ' + resp, logger.MESSAGE_TYPE.Error);
				return false;
			}

			dio.say(`:ok_hand: Nice <@${fromID}>. I'll see if anyone is <@&${x.lfg}>. Get ready to FIGHT! :crossed_swords:  Click to launch TnT: http://www.toothandtailgame.com/play`, data);
		});
	} else {
		let v = [
			`Yea ${from}, I'm aware you're ready. Chill, I'll let you know when someone else is. :stuck_out_tongue: `,
			`Hold your ponies ${from}, I know you're ready, let's wait for someone else. :thinking: `,
			`I know ${from}. Waiting for someone else to play...`,
			`Yea yea, now wait for someone else who wants to play, ${from}! :stuck_out_tongue: `,
			`You were already ready ${from}, but thanks for telling us. Again. :stuck_out_tongue_winking_eye: `
		];

		let n = Math.floor( Math.random()*4 );
		dio.say(v[n], data);
	}
});

let cmdUnready = new command('matchmake', '!unready', `This unmarks a player as **'Looking for a Game'**`, function(data) {
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID;

	dio.del( data.messageID, data);
	if (data.bot.servers[x.chan].members[fromID].roles.includes(x.lfg)) {
		data.bot.removeFromRole({
			serverID: x.chan,
			userID: fromID,
			roleID: x.lfg
		}, function(err, resp) {
			if (err) {
				logger.log(resp, logger.MESSAGE_TYPE.Error);
				return false;
			}

			dio.say(`🕑 Okee dokes ${from}. Unmarking you from the list. :+1:`, data);
		});
	} else {
		dio.say(`🕑 Uh, you were never ready to begin with ${from}, but thanks for letting us know.`, data);
	}
});

let cmdVerify = new command('matchmake', '!verify', `This posts a Steam link which automatically verifies the TnT directory`, function(data) {
	dio.say(":white_check_mark: Click here to verify your TnT files: http://toothandtailgame.com/verify", data);
});

let player1 = 0,
	player2 = 0,
	playersReady = false;
	dStart = false;
	
let cmdDraft = new command('matchmake', '!draft', `This will begin the drafting mode`, function(data) {
	
	if(player1 === 0 && player2 === 0) {
		player1 = data.userID;
		dio.say("You have entered the draft",data);
	} else {
		player2 = data.userID;
		dio.say("Both players have entered", data);
		playersReady = true;
	}
	if(playersReady) {
		if(player1 != 0 && player2 != 0) {
			dio.say("Drafting has begun!\nType `!select` <:schatz:230393920842891264> to end the draft\nType `!select` <:nguyen:230394513560961024> to reset the draft\nType `!select` <:masta:230396612797661185> to see how to draft", data);
			dStart = true;
		} else {
			dio.say("Looks like a player isn't in my database, resetting", data);
			player1 = 0,
			player2 = 0,
			dStart = false;
			playersReady = false;
		}
	}
});

let searching;

let tntUnits = [
	"Squirrel", "Lizard", "Toad", "Mole", "Pigeon",
	"Skunk", "Ferret", "Falcon", "Chameleon", "Snake",
	"Wolf", "Owl", "Fox", "Badger", "Boar",
	"Turret","Barbed Wire","Artillery","Balloon","Mine",
	],
	player1Units = [],
	player2Units = [],
	player1TurnCounter = 0,
	player2TurnCounter = 0,
	player1Turn = false,
	player2Turn = false;
	
let cmdSelect = new command ('matchmake', '!select', `This will select a unit for the players draft`, function(data) {
	if(!dStart) {
		dio.say("Looks like a draft hasn't been started, use `!draft` to start one", data);
	} else {
		if(player1TurnCounter === 0 || player2TurnCounter % 2 === 0) {
			dio.say(`<@${player1}> it's your pick`, data);
			player1Turn = true;
			player2Turn = false;
		}
		if(player1TurnCounter % 3 === 0 && player1TurnCounter != 0) {
			dio.say(`<@${player2}> it's your pick`, data);
			player1Turn = false;
			player2Turn = true;
		}
		if(player1TurnCounter != 6) {
			if( (player1Turn && data.userID === player1) || (player2Turn && data.userID === player2) ) {
				switch(data.args[1]) {
					case "<:schatz:230393920842891264>":
						dio.say("Ending draft...", data);
						player1 = 0,
						player2 = 0,
						player1TurnCounter = 0,
						player2TurnCounter = 0,
						player1Turn = false,
						player2Turn = false,
						player1Units = [],
						player2Units = [],
						playersReady = false;
						dStart = false;	
						break;
					case "<:nguyen:230394513560961024>":
						dio.say("Draft reset", data);
						player1TurnCounter = 0,
						player2TurnCounter = 0,
						player1Turn = false,
						player2Turn = false,
						player1Units = [],
						player2Units = [];
						break;
					case "<:squirrel:253727216251174915>":
						searching = "Squirrel";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntlizard:253727216456695808>":
						searching = "Lizard";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tnttoad:253732160706445313>":
						searching = "Toad";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:pigeon:253732160878411776>":
						searching = "Pigeon";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:mole:253728669808197643>":
						searching = "Mole"
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:falcon:253728670299062272>":
						searching = "Falcon"
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:ferret:253727216398106625>":
						searching = "Ferret"
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:skunk:253730191514402816>":
						searching = "Skunk"
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:chameleon:253730191556214784>":
						searching = "Chameleon"
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntsnake:253732160916291594>":
						searching = "Snake"
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntwolf:253730191556214795>":
						searching = "Wolf";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntowl:230095674148913164>":
						searching = "Owl";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntboar:230096277541486592>":
						searching = "Boar";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:badger:230094635903483904>":
						searching = "Badger";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntfox:253728670009524226>":
						searching = "Fox";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:turret:253571159264591873>":
						searching = "Turret";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:tntballoon:253570336967229450>":
						searching = "Balloon";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:mine:253570337340522496>":
						searching = "Mine";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:arty:253571159252140032>":
						searching = "Artillery";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					case "<:barbedwire:259083677571481611>":
						searching = "Artillery";
						findUnit(searching, data, tntUnits, player1Units, player2Units);
						break;
					default:
						dio.say("Unit not recognized", data);
						break;
				}
			} else {
				dio.say("Patience is a virtue, wait your turn", data);
			}
		} else {
			dio.say(`The draft is now over`, data);
			dio.say(`<@${player1}> Your units are ${player1Units}`, data);
			dio.say(`<@${player2}> Your units are ${player1Units}`, data);
			player1 = 0,
			player2 = 0,
			player1TurnCounter = 0,
			player2TurnCounter = 0,
			player1Turn = false,
			player2Turn = false,
			player1Units = [],
			player2Units = [],
			playersReady = false;
			dStart = false;
		}
	}
});

function findUnit(searching, data, tntUnits, player1Units, player2Units) {
	for (var i=0; i<=tntUnits.length; i++) {
		if (tntUnits[i] === searching) {
			dio.say(searching + " selected", data);
			tntUnits.splice(i, 1);
			if(player1Turn) {
				player1Units.push(searching);
			} else {
				player2Units.push(searching);
			}
			break;
		} else {
			dio.say("Unit already selected", data);
			break;
		}
	}
	if(player1Turn) {
		player1TurnCounter++;
	} else {
		player2TurnCounter++;
	}
};

module.exports.commands = [cmdReady, cmdUnready, cmdVerify, cmdDraft, cmdSelect];
