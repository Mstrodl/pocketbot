/* ----------------------------------------
	This file contains all the logic for
	Bookbot's "Last Man Standing" minigame.
 ---------------------------------------- */

const logger 		= require('../core/logger'),
	dio 			= require('../core/dio'),
	isBPG 			= require('../core/helpers').isBPG,
	shuffle 		= require('../core/helpers').shuffle,
	isDM	 		= require('../core/helpers').isDM,
	x				= require('../core/vars'),
	command 		= require('../core/command').Command,
	stripIndents 	= require('common-tags').stripIndents;

let match = {
	turn: 0, // keeps number of player whose turn it is; should probably rename this to turnIndex or similar
	minPlayers: 1, // number of players required to start a game
	playerEmbed: [],
	inProgress: false
};

let players = []; // gonna hold all players
let player, // holds only the person whose turn it is
	avoider,
	attacker,
	strayBullets = 0;

// This used to be ?rules
let cmd_lms = new command('lms', '!lms', "Find out more about Glyde's minigame **Last Man Standing**", function(data){   // Explanation of game command and rules.
	if (!isBPG(data)) {
		dio.say(`Last Man Standing (and all relevant commands) can only be done in the <#172429393501749248>`, data);
	} else {
		dio.say(stripIndents`
			__Last Man Standing Rules__
			The objective of this game is simple. Be the last man standing. Players are each equipped with a Revolver with 5 chambers.
			Players will take turns doing one of 3 actions: load, attack, or avoid.
			Each player will have 5 lives, and is eliminated once they lose all 5. Once all but one if left standing, that person wins.

			__Commands__
			**!join**: Adds yourself into the lobby. The game needs at least 2 but ideally 3 or more players to start.
			**!leave**: Removes yourself from the lobby.
			**!start**: Start the game.
			**!ff**: Leave a game in progress.

			**!load #**: load a bullet into your revolver chamber at location # (You start the game with a bullet at position 0.) After you load your gun the barrels will be spun and a random chamber will be at the trigger.\n# = 0,1,2,3, or 4

			**!attack #**: Attack a target at position # **continuously** until you hit an empty barrel. type in '!players' to see the list of players and their positions. If you want to fire multiple shots, line your bullets up in a row.

			**!avoid**: Avoid all incoming attacks until your next turn. If attacks are directed at you, you can choose one person (except your attacker) to take your hits for you. **Avoids last until your next turn** Limit: 3
			**!players**: See the list of players and their positions. **When a player is eliminated, player positions MAY be changed, so don't forget to check before you shoot!**

			**If you choose to load or avoid, DM bookbot so you can keep your decision a secret. Attack commands are done in the #botplayground.**
		`, data);
	}
});

let cmd_game = new command('lms', '!game', "Play some **'Last Man Standing'**", function(data){   //  THIS WILL BE CHANGED LATER AS MORE MINIGAMES ARE ADDED
	if (isBPG(data)) {
		dio.say(stripIndents`
			Game mode: Last Man Standing
			If you would like to join, type in **'!join'**.
			For rules, type in **'!rules'**.
			To see who's currently playing or looking to play, type in **'!players'**
		`, data);
	}
});

let cmd_join = new command('lms', '!join', "Join a round **'Last Man Standing'** if no game is in progress", function(data){
	if (isBPG(data)) {
		if (match.inProgress) {
			dio.say(`This game is currently in session, please wait until the game is finished.`, data);
		} else {
			// check if players has joined already
			let isInPlayers = players.some(function(val, index, arr) {
				return players[index].ID === data.userID;
			});

			if (isInPlayers) {
				dio.say(`Hold up, there's only one of you, and that one's already joined.`, data);
			} else {
				players.push({
					ID: data.userID,
					name: data.user,
					hitpoints: 5,
					bullets: [true, true, true, true, true],
					triggerPos: Math.floor(Math.random() * 5),
					avoids: 3,
					isAvoiding: false
				});

				dio.say(`You have successfully joined the game.`, data);
			}
		}
	}
});

// fix this --- did it I think
let cmd_leave = new command('lms', '!leave', "Leave a round of **'Last Man Standing'**", function(data){
	if (isBPG(data)) {
		if (match.inProgress) {
			dio.say("This game is currently in session, please wait until the game is finished.", data);
		} else {
			if (data.userID in players) {
				removePlayer(data.userID);
				dio.say("Deciding to stay alive today I see, wise.", data);
			} else {
				dio.say(`How would you leave a game you haven't joined?`, data);
			}
		}
	}
});

let cmd_players = new command('lms', '!players', "Show all currently living players for **'Last Man Standing'**", function(data){
	if (isBPG(data)) {
		if (match.inProgress) {
			players.forEach(function(val, index) {
				match.playerEmbed.push({
					name: `#${index + 1} ${players[index].name}`,
					value: `has ${players[index].hitpoints} HP remaining.`,
					inline: true
				});
			});

			data.bot.sendMessage({
				to: data.channelID,
				embed: {
					title: `Current players`,
					description: `Players begin with 5 hitpoints. When somebody loses all their hitpoints, they die.`,
					fields: match.playerEmbed
				}
			});
			match.playerEmbed = [];
		} else {
			dio.say(`There's no game in progress right now.`, data);
		}
	}
});

let cmd_start = new command('lms', '!start', "Start playing a round of **'Last Man Standing'**", function(data) {
	if (isBPG(data)) {
		if (!match.inProgress) {
			if (players.length >= match.minPlayers) {
				shuffle(players);
				player = players[match.turn];
				match.inProgress = true;
				dio.say(stripIndents`
					Well well well... looks like this saloon ain't big enough for the ${players.length} of ya. Well then, let's just see who'll be the Last Man Standing.
				
					<@${players[match.turn].ID}>, You are to start.`, data);
			} else {
				dio.say(`There is not enough people to start the game. We're going to need at least ${match.minPlayers} people.`, data);
			}
		}
	}
});

// does not reset atm, why?
let cmd_reset = new command('lms', '!reset', "Reset and abort a round of **'Last Man Standing'**", function(data) {
	if (isBPG(data)) {
		if (match.inProgress) {
			resetGame();
			dio.say("Deciding to stay alive today I see, wise.", data);
		}
	}
});

function removePlayer(him) {
	players.forEach(function(val, index) {
		if (players[index].ID === him) {
			players.splice[index, 1];
			return;
		}
	});
}

function nextTurn(data, msg=null) {
	if (match.turn === players.length - 1) {
		match.turn = 0;
	} else {
		match.turn++;
	}

	player = players[match.turn];

	if (msg != null) {
		dio.say(msg, data);
	}

	console.log(players);
	console.log(players.length);

	if (players.length === 1) {
		dio.say(stripIndents`
			${msg}

			:tada: Congratulations, <@${player.ID}>! You are the Last Man Standing! :tada:
		`, data);
		resetGame();
		return;
	}

	player.isAvoiding = false; // remove avoid-buff from player

	dio.say(stripIndents`
		<@${player.ID}>: It is now your turn.
	`, data, x.playground);
};

function isMyTurn(data) {
	if (data.userID != players[match.turn].ID) {
		return false;
	} else {
		return true;
	}
};

function resetGame() {
	let match = {
		turn: 0,
		minPlayers: 1,
		playerEmbed: [],
		inProgress: false
	};

	players = [];
};

let cmd_load = new command('lms', '!load', "Load a new bullet into your barrel", function(data){
	if (match.inProgress) {
		if (isDM(data)) {  // command was sent correctly via DM
			if (!isMyTurn(data)) {
				dio.say(`Please wait until your turn.`, data);
			}  // if not the person's turn

			else {
				let chamberInt = data.args[1];
				if (chamberInt < 1 || chamberInt > 5 || isNaN(chamberInt)) {
					dio.say(`That is not a valid chamber location. Valid bullet chambers are: 1, 2, 3, 4 and 5.`, data);
				} else if (player.bullets[chamberInt - 1] === true) {
					dio.say(`Bullet already loaded into this chamber, please select another.`, data);
				} else {
					let bulletConfig = stripIndents`
						\`\`\`**Current Bullet configuration**:

						Chamber: 1-2-3-4-5
						Bullets: `;
					player.bullets[chamberInt - 1] = true; // insert bullet
					for(let i = 0; i < 5 ; i++) {
						if (i != 4) {
							if (player.bullets[i] === true) {
								bulletConfig += `O-`;
							} else {
								bulletConfig += `X-`;
							}
						} else if (player.bullets[i] === true) {
							bulletConfig += `O\`\`\``;
						} else {
							bulletConfig += `X\`\`\``;
						}
					}
					// players.bullets[match.turn] = Math.floor(Math.random() * 5); spin the chamber ??????
					// rather than spinning the chamber, change triggerPos?
					player.triggerPos = Math.floor(Math.random() * 5); // <-- like so
					nextTurn(data, stripIndents`
						Load confirmed into chamber ${chamberInt}.

						${bulletConfig} Spinning bullet chamber... Done.
					`);
				}
			}
		}
	}
});

let cmd_avoid = new command('lms', '!avoid', "If somebody shoots at you this round, avoid the attack", function(data){
	if (match.inProgress) {
		if (isDM(data)) {
			if (!isMyTurn) {
				dio.say(`Please wait until your turn.`, data);
			} else { // player is out of avoids
				if (!player.avoids > 0) {
					dio.say(`You no longer have Avoids left.`, data);
				} else { // player has avoids left
					player.avoids--;
					player.isAvoiding = true; // make sure he avoids until next turn
					nextTurn(data, stripIndents`
						Avoid confirmed.
						Remaining avoids: ${player.avoids}.
					`);
				}
			}
		}
	}
});

let cmd_ff = new command('lms', '!ff', "Leave a game in progress", function(data){
	if (match.inProgress) {
		if (isBPG(data)) {
			removePlayer(data.userID);

			if (isMyTurn) {
				nextTurn(data, `<@${player.ID}> decided seeing the light of day was better than dying and has fled the battle.`);
			} else {
				dio.say(`<@${data.userID}> decided seeing the light of day was better than dying and has fled the battle.`, data);
			}
		}
	}
});

let cmd_attack = new command('lms', '!attack', "Attack one of your opponents", function(data){
	if ((isBPG(data) /*|| isDM(data)*/) && match.inProgress) {
		let targetIndex = parseInt(data.args[1]) - 1;
		let target = players[targetIndex];

		if (targetIndex < 0 || targetIndex >= players.length || isNaN(targetIndex)) {
			dio.say(`That is not a valid target. Check to see who your targets are with '!players'.`, data);
		} else {
			if (strayBullets != 0 && player === avoider) { // someone who avoided is attacking
				if (target.ID === attacker) {
					dio.say(`You cannot redirect the bullets to your attacker. Choose someone else.`, data);
				} else if (target.ID === data.userID) {
					dio.say(`You try, but you're just not fast enough to run into the bullets you just dodged, maybe if you try again?`, data);
				} else if (target.isAvoiding === true) {
					attacker = avoider;
					avoider = target.ID;
					dio.say(stripIndents`
						The ${strayBullets} stray bullets missed <@${target.ID}>.
						
						<@${avoider}>, Please select the unfortunate fellow who stood behind you with the '!attack #' command.`
					, data);
				} else { // not avoided (stray bullet)
					target.hitpoints -= strayBullets;
					let atkMessage = `The stray bullets put ${strayBullets} holes into <@${target.ID}>...`;
					
					if (target.hitpoints < 1) { // player died
						atkMessage += ` killing them in the process. :dizzy_face::gun:\n`;
						removePlayer(target.ID);

						nextTurn(data, atkMessage);
					}

					strayBullets = 0;
					nextTurn(data, atkMessage);
				}
			} else { // regular attack
				if(!isMyTurn(data)) { // not the player's turn
					dio.say(`Please wait until your turn.`, data);
				} else {
					let atkMessage = ``;
					let atkSuccess = 0;

					// count successful attacks
					let neverBroke = true;
					for (let i = player.triggerPos; i < 5; i++) {
						if (player.bullets[i] === true) {
							atkSuccess++;
							player.bullets[i] = false;
							// chamberList[playerTurn] = (chamberList[playerTurn] + 1) % 5; wat dis do
							player.triggerPos++;
						} else {
							// chamberList[playerTurn] = (chamberList[playerTurn] + 1) % 5; wat dis do
							neverBroke = false;
							player.triggerPos++;
							break;
						}
					}

					if (neverBroke) {
						for (let i = 0; i < player.triggerPos; i++) {
							if (player.bullets[i] === true) {
								atkSuccess++;
								player.bullets[i] = false;
								player.triggerPos++;
							} else {
								player.triggerPos++;
								break;
							}
						}
					}

					if (atkSuccess === 0) { // no shots fired
						nextTurn(data, stripIndents`
							*click!*
							The chamber was empty.
						`);
					} else {
						atkMessage += `${atkSuccess} shots were fired`;

						// check victim's avoid status
						if (players[targetIndex].isAvoiding === true) { // avoided
							atkMessage += ` but <@${target.ID}> was able to avoid being hit.`;

							if (players.length != 2) {
								avoider = players[targetIndex].ID;
								attacker = player;
								strayBullets = atkSuccess;
								dio.say(stripIndents`
									${atkMessage}
									${avoider}, Please select the unfortunate fellow who got shot on your behalf with the '!attack #' command.
								`, data);
							} else { // only two players, cannot redirect bullets
								nextTurn(data, atkMessage);
							}
						} else { // not avoided
							target.hitpoints -= atkSuccess;
							atkMessage += ` and hit <@${target.ID}>`;

							if (target.hitpoints < 1) { // target died
								atkMessage += ` eliminating the player. :dizzy_face::gun:\n`;
								removePlayer(target);

								nextTurn(data, atkMessage);
							}

							nextTurn(data, atkMessage + ".");
						}
					}
				}
			}
		}
	}
});

module.exports.commands = [cmd_lms, cmd_game, cmd_join, cmd_leave, cmd_players, cmd_start, cmd_reset, cmd_load, cmd_avoid, cmd_attack];