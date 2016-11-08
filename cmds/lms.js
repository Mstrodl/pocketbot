let logger  = require('../core/logger'),
	dio		= require('../core/dio'),
    isBPG	= require('../core/helpers').isBPG,
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
let cmd_lms = new command('bookbot', '!lms', "Find out more about Glyde's minigame Last Man Standing", function(data){
    if (isBPG) {
        dio.say("Last Man Standing (and all relevant commands) can only be done in the <#172429393501749248>", data);
    } else {
	dio.say("__Last Man Standing Rules__\n"+
					"The objective of this game is simple. Be the last man standing. Players are each equipped with a Revolver with 5 chambers. \n"+
					"Players will take turns doing one of 3 actions: load, attack, or avoid.\n"+
					"Each player will have 5 lives, and is eliminated once they lose all 5. Once all but one if left standing, that person wins.\n\n"+
					
					"__Commands__\n"+
					"**?Load #**: load a bullet into your revolver chamber at location # (You start the game with a bullet at position 0.) # = 0,1,2,3, or 4\n"+
					"**?Attack #**: Attack a target at position # continuously until you misfire. type in '?players' to see the list of players and their positions.\n"+
					"**?Avoid**: Avoid all incoming attacks until your next turn. If attacks are directed at you, you can choose one person (except your attacker) to take your hits for you. **Avoids last until your next turn** Limit: 3\n"+
					"**?Players**: See the list of players and their positions. **When a player is eliminated, player positions MAY be changed, so don't forget to check before you shoot!**\n\n"+
					
					"**If you choose to load or avoid, DM bookbot so you can keep your decision a secret. Attack commands are done in the #botplayground.**", data);
    }
});

let cmd_game = new command('bookbot', '!game', "Play some **'Last Man Standing'**", function(data){
    if (isBPG) {
	    dio.say("Game mode: Last Man Standing\nIf you would like to join, type in **'?join'**. \nFor rules, type in **'?rules'**. \nTo see who's currently playing or looking to play, type in **'?players'**", data);
    }
});

let cmd_join = new command('bookbot', '!join', "Join **'Last Man Standing'**", function(data){
    if (isBPG) {
        if (gameInProgress) {
            dio.say("This game is currently in session, please wait until the game is finished.", data);
        } else {
            var i = 0;
            var alreadyJoined = false;
            
            for (i = 0; i < playerList.length; i++) {
                if(playerList[i] === data.user) {
                    dio.say("Hold up, there's only one of you, and that one's already joined.", data);
                    alreadyJoined = true;
                }
            }

            if (!alreadyJoined) {
                playerList.push(data.user);
                dio.say("You have successfully joined the game.", data);
            }
        }
    }
});

// fix this
let cmd_leave = new command('bookbot', '!leave', "Leave **'Last Man Standing'**", function(data){
	if (isBPG) {
        if (gameInProgress) {
            dio.say("This game is currently in session, please wait until the game is finished.", data);
        } else {
            var i = 0;
            for (i = 0; i <playerList.length; i++) {
                if(playerList[i] === data.user) {
                    playerList.splice(i,1);
                    break;
                }
            }
            dio.say("Deciding to stay alive today I see, wise.", data);
        }
    }
});

let cmd_players = new command('bookbot', '!players', "Show all current players for **'Last Man Standing'**.", function(data){
    if (isBPG) {
        let playerMessage = "__Current Players__\n```";

        if(gameInProgress) {
            for (let i = 0; i < playerList.length; i++) {
                playerMessage += i + ") " + playerList[i].username + " has "+ lifeList[i] + "HP left.\n";
            }

            dio.say(playerMessage + "```", data);
        } else {
            for (let i = 0; i < playerList.length; i++) {
                playerMessage += i + ") " + playerList[i].username + "\n";
            }

            dio.say(playerMessage + "```", data);
        }
    }
});

let cmd_start = new command('bookbot', '!start', "Start playing **'Last Man Standing'**.", function(data) {
    if (gameInProgress) {
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
            dio.say("Well well well... looks like this saloon ain't big enough of the "+ playerList.length +" of ya. Well then, let's just see who'll be the Last Man Standing.\n\n"+playerList[playerTurn]+", You are to start.", data);
        } else {
            dio.say("There is not enough people to start the game. We're going to need at least 3 people.", data);
        }
    }
});

let cmd_load = new command('bookbot', '!load', "hans", function(data){
    if (gameInProgress) {
        if (message.channel.isPrivate) {
			if(message.author != playerList[playerTurn]) {
				bot.sendMessage(message, "Please wait until your turn.");
			}
			
			else {
				avoidList[playerTurn] = false;
				var chamberInt = parseInt(input.substring(5));
				if ( chamberInt < 0 || chamberInt > 4 || isNaN(chamberInt))
				{
					bot.sendMessage(message, "That is not a valid chamber location. Valid bullet chambers are: 0, 1, 2, 3, and 4");
				}
				else if (bulletList[playerTurn][chamberInt] === 1)
				{
					bot.sendMessage(message, "Bullet already loaded into this chamber, please select another.");
				}
				else
				{
					var bulletConfig = "__Current Bullet configuration__: \n"+
					"```Chamber: 0-1-2-3-4\n"+
					"Bullets: ";
					var i = 0;
					bulletList[playerTurn][chamberInt] = 1; //insert bullet
					for( i = 0; i < 5 ; i++)
					{
						if ( i != 4)
						{
							if (bulletList[playerTurn][i] === 1)
							{
								bulletConfig += "O-";
							}
							else
							{
								bulletConfig += "X-";
							}
						}
						else
						{
							if (bulletList[playerTurn][i] === 1)
							{
								bulletConfig += "O```\n";
							}
							else
							{
								bulletConfig += "X```\n";
							}
						}
					}
					bot.sendMessage(message.author, "load confirmed into chamber "+ chamberInt+ "\n"+
					bulletConfig + "Spinning bullet chamber... Done.");
					
					chamberList[playerTurn] = Math.floor(Math.random() * 5); //spin the chamber
					playerTurn = (playerTurn + 1) % playerList.length; //next person's turn
					bot.sendMessage("172429393501749248", playerList[playerTurn] + ": It is now your turn.");
				}
			}			
		}
    }

	dio.say("", data);
});

let cmd_avoid = new command('bookbot', '!avoid', "hans", function(data){
	dio.say("", data);
});

let cmd_attack = new command('bookbot', '!attack', "hans", function(data){
	dio.say("", data);
});

module.exports.commands = [cmd_lms, cmd_game, cmd_join, cmd_leave, cmd_load];

// Template
/* 

let cmd_ = new command('bookbot', '!ping', "hans", function(data){
	dio.say("", data);
});

*/