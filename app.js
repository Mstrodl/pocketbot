"use strict"

// Get the libs
let chat 	= require('discord.io'),
	path 	= require('path'),
	Fb 		= require("firebase"),
	fs 		= require('fs'),
	gm 		= require('gm').subClass({ imageMagick: true }),
	steam 	= require('steam-webapi');

// Modules
let TOKEN 	= require('./core/tokens'),
	command = require('./core/command'),
	logger 	= require('./core/logger'),
	persona = require('./core/personality'),
	helper	= require('./core/helpers'),
	vars 	= require('./core/vars');

// Initialize Firebase Stuff

var config = {
	apiKey: TOKEN.FBKEY,
	authDomain: "pocketbot-40684.firebaseapp.com",
	databaseURL: "https://pocketbot-40684.firebaseio.com",
	storageBucket: "pocketbot-40684.appspot.com",
	messagingSenderId: "969731605928"
};

Fb.initializeApp(config);

let fire = {
	soldiers: 	Fb.database().ref("players"),
	// emails: 	Fb.database().ref("email"),
	// keys: 		Fb.database().ref("key"),
	quotes: 	Fb.database().ref("quote")
}

var mjPersona = new persona('MJ Bot', './assets/avatars/mj.png');
let mastabot = new persona('Mastabot', './assets/avatars/mastabot.png');

var globalCommandManager	= new command.CommandManager(),
	basicCmdGroup 		= new command.CommandGroup('basic', mastabot),
	mjCmdGroup 			= new command.CommandGroup('mj', mjPersona);

let matchCmdGroup 		= new command.CommandGroup('matchmake', mastabot),
	crownCmdGroup 		= new command.CommandGroup('crown', mastabot),
	quoteCmdGroup 		= new command.CommandGroup('quote', mastabot),
	communityCmdGroup 	= new command.CommandGroup('community', mastabot);

globalCommandManager.addGroup(basicCmdGroup);
globalCommandManager.addGroup(matchCmdGroup);
globalCommandManager.addGroup(crownCmdGroup);
globalCommandManager.addGroup(quoteCmdGroup);
globalCommandManager.addGroup(communityCmdGroup);
globalCommandManager.addGroup(mjCmdGroup);

// Clear the log file
logger.clearLogFile();

// Parse the cmds dir and load any commands in there
fs.readdir(path.join(__dirname, 'cmds'), function(err, files){
	if(err){
		logger.log(err, logger.MESSAGE_TYPE.Error);
		return;
	}

	for(var i = 0; i < files.length; i++){
		let _cmds = require(path.join(__dirname, 'cmds', path.parse(files[i]).name)).commands;

		_cmds.forEach(function(element) {
			globalCommandManager.addCommand(element);
		}, this);
	}
});

//This stays a var. You change it back to let, we fight
var bot = new chat.Client({ token: TOKEN.TOKEN, autorun: true });

bot.on('ready', function(event) {
	logger.log("Bot logged in successfully.", logger.MESSAGE_TYPE.OK);
});

bot.on('message', function(user, userID, channelID, message, event){
	//Remove whitespace
	message = message.trim()

	//Split message into args
	let args = helper.getArgs(message);

	//Prepare command_data object
	let command_data = {
		// Command manager
		commandManager: globalCommandManager,
		// Bot client object
		bot: bot,
		// Name of user who sent the message
		user: user,
		// ID of user who sent the message
		userID: userID,
		// ID of channel the message was sent in
		channelID: channelID,
		// Raw message string
		message: message,
		// ID of the message sent
		messageID: event.d.id,
		// Array of arguments/words in the message
		args: args,
		// Reference to the Firebase DB's
		db: fire
	}

	// Dance Detector
	if (message.includes('o') || message.includes('0') && fromID === "149541152322879489" ) {
		if ( message.includes('/') || message.includes('\\') || message.includes('<') || message.includes('>') ) {
			logger.log("Dancer Detected", logger.MESSAGE_TYPE.Warn);
			command_data.dance = event.d.id;
		}
	}

	try {
		logger.log(user + ": " + message);
		if (globalCommandManager.isTrigger(args[0])){
			globalCommandManager.getGroup(globalCommandManager
								.getCommand(args[0]).groupName)
								.personality.set(command_data, function(){
									globalCommandManager.call(command_data, args[0]);
								});
		}
	} catch(e) {
		bot.sendMessage({
			to: channelID,
			message: `An error occured inside the '${args[0]}' command code`
		});
		logger.log(e.message, logger.MESSAGE_TYPE.Error);
	}
});
