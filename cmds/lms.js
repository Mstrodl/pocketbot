let logger  = require('../core/logger'),
	dio		= require('../core/dio'),
    isBPG	= require('../core/helpers').isBPG,
	x		= require('../core/vars'),
	command = require('../core/command').Command;

var gameMode = 0;
var playerList = [];
var yes = [];
var no = [];
var bulletList = []; //contain's players bullet placements
var chamberList = []; //contain's where the trigger is located.
var avoidCount = []; //keeps track of number of avoids used
var avoidList = [];//whether avoid has been used.
var lifeList = []; //player's lives
var playerTurn = 0;
var strayBullets = 0;
var avoider;
var attacker;
var gameInProgress = false;

// This used to be ?rules
let cmd_lms = new command('lms', '!lms', "Find out more about Glyde's minigame Last Man Standing", function(data){
    if (!isBPG(data)) {
        dio.say("Last Man Standing (and all relevant commands) can only be done in the <#172429393501749248>", data);
    } else {
	dio.say("__Last Man Standing Rules__\n"+
					"The objective of this game is simple. Be the last man standing. Players are each equipped with a Revolver with 5 chambers. \n"+
					"Players will take turns doing one of 3 actions: load, attack, or avoid.\n"+
					"Each player will have 5 lives, and is eliminated once they lose all 5. Once all but one if left standing, that person wins.\n\n"+
					
					"__Commands__\n"+
					"**!load #**: load a bullet into your revolver chamber at location # (You start the game with a bullet at position 0.) # = 0,1,2,3, or 4\n"+
					"**!attack #**: Attack a target at position # continuously until you misfire. type in '!players' to see the list of players and their positions.\n"+
					"**!avoid**: Avoid all incoming attacks until your next turn. If attacks are directed at you, you can choose one person (except your attacker) to take your hits for you. **Avoids last until your next turn** Limit: 3\n"+
					"**!players**: See the list of players and their positions. **When a player is eliminated, player positions MAY be changed, so don't forget to check before you shoot!**\n\n"+
					
					"**If you choose to load or avoid, DM bookbot so you can keep your decision a secret. Attack commands are done in the #botplayground.**", data);
    }

	return "Execution successful.";
});

let cmd_game = new command('lms', '!game', "Play some **'Last Man Standing'**", function(data){
    if (isBPG(data)) {
	    dio.say("Game mode: Last Man Standing\nIf you would like to join, type in **'!join'**. \nFor rules, type in **'!rules'**. \nTo see who's currently playing or looking to play, type in **'!players'**", data);
		return "Execution successful.";
    }

	return "Execution not successful: Incorrect channel.";
});

let cmd_join = new command('lms', '!join', "Join **'Last Man Standing'**", function(data){
    if (isBPG(data)) {
        if (gameInProgress) {
            dio.say("This game is currently in session, please wait until the game is finished.", data);
        } else {
            var i = 0;
            var alreadyJoined = false;
            
            for (i = 0; i < playerList.length; i++) {
                if(playerList[i] === data.userID) {
                    dio.say("Hold up, there's only one of you, and that one's already joined.", data);
                    alreadyJoined = true;
                }
            }

            if (!alreadyJoined) {
                playerList.push(data.userID);
                dio.say("You have successfully joined the game.", data);
            }
        }

		return "Execution successful.";
    }

	return "Execution not successful: Incorrect channel.";
});

// fix this
let cmd_leave = new command('lms', '!leave', "Leave **'Last Man Standing'**", function(data){
	if (isBPG(data)) {
        if (gameInProgress) {
            dio.say("This game is currently in session, please wait until the game is finished.", data);
        } else {
            var i = 0;
            for (i = 0; i <playerList.length; i++) {
                if(playerList[i] === data.userID) {
                    playerList.splice(i,1);
                    break;
                }
            }
            dio.say("Deciding to stay alive today I see, wise.", data);
        }

		return "Execution successful.";
    }

	return "Execution not successful: Incorrect channel.";
});

let cmd_players = new command('lms', '!players', "Show all current players for **'Last Man Standing'**.", function(data){
    if (isBPG(data)) {
        let playerMessage = "**__Current Players__**\n\n";

        if(gameInProgress) {
            for (let i = 0; i < playerList.length; i++) {
                playerMessage += `${i}) <@${playerList[i]}> has ${lifeList[i]} HP left.\n`;
            }

            dio.say(playerMessage, data);
        } else {
            dio.say("There's no game in progress right now.", data);
        }

		return "Execution successful.";
    }

	return "Execution not successful: Incorrect channel.";
});

let cmd_start = new command('lms', '!start', "Start playing **'Last Man Standing'**.", function(data) {
	if (isBPG(data)) {
		if (!gameInProgress) {
			if (playerList.length > 1) {
				for (let i = 0; i <playerList.length ; i++) {
					bulletList.push([1,0,0,0,0,0]);
					chamberList.push(Math.floor(Math.random() * 5));
					avoidCount.push(3);
					avoidList.push(false);
					lifeList.push(5);
				}
				gameInProgress = true;
				playerTurn = Math.floor(Math.random() * (playerList.length));
				dio.say(`Well well well... looks like this saloon ain't big enough for the ${playerList.length} of ya. Well then, let's just see who'll be the Last Man Standing.\n\n <@${playerList[playerTurn]}>, You are to start.`, data);
			} else {
				dio.say("There is not enough people to start the game. We're going to need at least 2 people.", data);
			}
		}

		return "Execution successful.";
	}

	return "Execution not successful: Incorrect channel.";
});

let cmd_reset = new command('lms', '!reset', "Reset **'Last Man Standing'**.", function(data) {
	if (isBPG(data)) {
		if (gameInProgress) {
			playerList = [];
			bulletList = []; 
			chamberList = []; 
			avoidCount = []; 
			avoidList = [];
			lifeList = []; 
			playerTurn = 0;
			strayBullets = 0;
			avoider = null;
			gameInProgress = false;
			gameMode = 0;
			dio.say("Deciding to stay alive today I see, wise.", data);

			return "Execution successful.";
		}

		return "Execution not successful: No game in progress.";
	}

	return "Execution not successful: Incorrect channel.";
});

let cmd_load = new command('lms', '!load', "hans", function(data){
    if (gameInProgress) {
        if (data.channelID in data.bot.directMessages) {
			if(data.userID != playerList[playerTurn]) {
				dio.say("Please wait until your turn.", data);
			}
			
			else {
				avoidList[playerTurn] = false;
				var chamberInt = parseInt(data.args[1]);
				if ( chamberInt < 0 || chamberInt > 4 || isNaN(chamberInt)) {
					dio.say("That is not a valid chamber location. Valid bullet chambers are: 0, 1, 2, 3, and 4", data);
				}
				else if (bulletList[playerTurn][chamberInt] === 1) {
					dio.say("Bullet already loaded into this chamber, please select another.", data);
				} else {
					var bulletConfig = "__Current Bullet configuration__: \n"+
					"```Chamber: 0-1-2-3-4\n"+
					"Bullets: ";
					var i = 0;
					bulletList[playerTurn][chamberInt] = 1; //insert bullet
					for( i = 0; i < 5 ; i++) {
						if ( i != 4) {
							if (bulletList[playerTurn][i] === 1) {
								bulletConfig += "O-";
							} else {
								bulletConfig += "X-";
							}
						} else {
							if (bulletList[playerTurn][i] === 1) {
								bulletConfig += "O```\n";
							} else {
								bulletConfig += "X```\n";
							}
						}
					}
					dio.say("Load confirmed into chamber " + chamberInt + "\n" + bulletConfig + "Spinning bullet chamber... Done.", data);
					
					chamberList[playerTurn] = Math.floor(Math.random() * 5); //spin the chamber
					playerTurn = (playerTurn + 1) % playerList.length; //next person's turn
					dio.say(`<@${playerList[playerTurn]}> It is now your turn.`, data, x.playground);
				}
			}

			return "Execution successful.";
		}

		return "Execution not successful: Incorrect channel.";
    }

	return "Execution not successful: No game in progress.";
});

let cmd_avoid = new command('lms', '!avoid', "hans", function(data){
	if (gameInProgress) {
		if (data.channelID in data.bot.directMessages) {
			if (data.userID != playerList[playerTurn]) {
				dio.say("Please wait until your turn.", data);
			} else {
				if (avoidCount[playerTurn] === 0) {
					dio.say("You no longer have Avoids left.", data);
				} else { //avoids available 
					avoidCount[playerTurn]--; //decrese avoid count
					avoidList[playerTurn] = true; //make sure he avoids until next turn
					dio.say("Avoid confirmed.", data);
					playerTurn = (playerTurn + 1) % playerList.length; //next person's turn
					dio.say(`<@${playerList[playerTurn]}>: It is now your turn.`, data, x.playground);
				}
			}

			return "Execution successful.";
		}

		return "Execution not successful: Incorrect channel.";
	}

	return "Execution not successful: No game in progress.";
});

let cmd_attack = new command('lms', '!attack', "hans", function(data){
	if (isBPG(data)) {
		var target = parseInt(data.args[1]);
		if ( target < 0 || target >= playerList.length || isNaN(target)) {
			dio.say("That is not a valid target. Check to see who your targets are with '!players'.", data);
		} else {
			if (strayBullets != 0 && data.userID === avoider) { //someone who avoided is attacking 
				if (playerList[target] === attacker) {
					dio.say("You cannot redirect the bullets to your attacker. Choose someone else.", data);
				} else if (playerList[target] === data.userID) {
					dio.say("You try, but you're just not fast enough to run into the bullets you just dodged, maybe if you try again?", data);
				} else if (avoidList[target] === true) { //avoided
					attacker = avoider;
					avoider = playerList[target];
					dio.say("The " + strayBullets + " stray bullets missed "+ playerList[target] +". \n\n"+avoider + ", Please select the unfortunate fellow who was behind you with the '!attack #' command.", data);
				} else { //not avoided (stray bullet)
					lifeList[target] -= strayBullets;
					var atkMessage = "The stray bullets put "+ strayBullets + " holes into " + playerList[target] + "...";
					avoider = null;
					attacker = null;
					strayBullets = 0;
					if (lifeList[target] < 1) { //player died
						atkMessage += "killing him/her in the process.\n\n";
						playerList.splice(target, 1);
						bulletList.splice(target, 1);
						chamberList.splice(target, 1);
						avoidCount.splice(target, 1);
						avoidList.splice(target, 1);
						lifeList.splice(target, 1);
						
						
						if (playerTurn >= target ) {
							playerTurn--;
						}
						
						if (playerList.length === 1) {
							dio.say(`${atkMessage} :tada: Congratulations, <@${playerList[playerTurn]}>! You are the Last Man Standing! :tada:`, data);
							playerList = [];
							bulletList = []; 
							chamberList = []; 
							avoidCount = []; 
							avoidList = [];
							lifeList = []; 
							playerTurn = 0;
							strayBullets = 0;
							avoider = null;				//reset game
							gameInProgress = false;
							gameMode = 0;
						}	
					}

					if (playerList.length != 0) {
						playerTurn = (playerTurn + 1) % playerList.length;
						dio.say(`${atkMessage} <@${playerList[playerTurn]}>: it is now your turn.`, data);
					}
				}				
			} else { //regular attack

				if(data.userID != playerList[playerTurn]) { //not the player's turn
					dio.say("Please wait until your turn.", data);
				} else {
					avoidList[playerTurn] = false;
					var atkMessage = "";
					var i = 0;
					var atkSuccess = 0;
					
					//count successful attacks
					for(i= 0; i < 6; i++) {
						if ((bulletList[playerTurn])[(chamberList[playerTurn])] === 1) {
							atkSuccess++;
							bulletList[playerTurn][chamberList[playerTurn]] = 0;
							chamberList[playerTurn] = (chamberList[playerTurn] + 1) % 5;
						} else {
							chamberList[playerTurn] = (chamberList[playerTurn] + 1) % 5;
							break;
						}
					}
					
					if ( atkSuccess === 0) { //no shots fired
						playerTurn = (playerTurn + 1) % playerList.length; //next person's turn
						dio.say(`*click!*\nThe attack failed.\n <@${playerList[playerTurn]}>: It is now your turn.`, data);
					} else {
						atkMessage += atkSuccess + " shots were fired ";

						//check victim's avoid status
						if (avoidList[target] === true) { //avoided
							atkMessage += "but " + playerList[target] + " was able to avoid being hit.";
							
							if (playerList.length != 2) {
								avoider = playerList[target];
								attacker = playerList[playerTurn];
								strayBullets = atkSuccess;
								dio.say(atkMessage + "\n"+avoider + ", Please select the unfortunate fellow who got shot on your behalf with the '!attack #' command.", data);
							} else {
								playerTurn = (playerTurn + 1) % playerList.length; //next person's turn
								dio.say(`${atkMessage}\n <@${playerList[playerTurn]}>: It is now your turn.`, data);
							}
						} else { //not avoided
							lifeList[target] -= atkSuccess;
							atkMessage += `and hit <@${playerList[target]}>`;
							
							if (lifeList[target] < 1) { //player died.
								atkMessage += `eliminating the player. :dizzy_face::gun:`;
								playerList.splice(target, 1);
								bulletList.splice(target, 1);
								chamberList.splice(target, 1);
								avoidCount.splice(target, 1);
								avoidList.splice(target, 1);
								lifeList.splice(target, 1);
								
								if (playerTurn >= target ) {
									playerTurn--;
								}	
								
								if (playerList.length === 1) {
									dio.say(`${atkMessage} :tada: Congratulations, <@${playerList[playerTurn]}>! You are the Last Man Standing! :tada:`, data);
									playerList = [];
									bulletList = []; 
									chamberList = []; 
									avoidCount = []; 
									avoidList = [];
									lifeList = []; 
									playerTurn = 0;
									strayBullets = 0;
									avoider = null;				//reset game
									gameInProgress = false;
									gameMode = 0;
								}
								
							}
							
							if (playerList.length != 0) {
								playerTurn = (playerTurn + 1) % playerList.length;
								dio.say(`${atkMessage}\n <@${playerList[playerTurn]}>: it is now your turn.`, data);
							}
						}
					}
				}
			}	
		}

		return "Execution successful.";
	}

	return "Execution not successful: Incorrect channel.";
});

module.exports.commands = [cmd_lms, cmd_game, cmd_join, cmd_leave, cmd_players, cmd_start, cmd_load, cmd_avoid, cmd_attack];