"use strict"

// ===================================
// Libraries
// ===================================
let chat 	= require('discord.io'),
	path 	= require('path'),
	Fb 		= require("firebase"),
	fs 		= require('fs'),
	gm 		= require('gm').subClass({ imageMagick: true }),
	steam 	= require('steam-webapi');

// ===================================
// Modules
// ===================================
let TOKEN 		= require('./core/tokens'),
	command 	= require('./core/command'),
	logger 		= require('./core/logger'),
	persona 	= require('./core/personality'),
	userdata 	= require('./core/userdata'),
	status 		= require('./core/presence'),
	helper		= require('./core/helpers'),
	vars 		= require('./core/vars'),
	dio 		= require('./core/dio');

// ===================================
// Initialize Firebase Stuff
// ===================================
let config = {
	apiKey: TOKEN.FBKEY2(),
	authDomain: 		"pocketbot-40684.firebaseapp.com",
	databaseURL: 		"https://pocketbot-40684.firebaseio.com",
	storageBucket: 		"pocketbot-40684.appspot.com",
	messagingSenderId: 	"969731605928"
};

let fire = false;
if ( TOKEN.FBKEY2() != false ) {
	Fb.initializeApp(config);

	fire = {
		soldiers: 	Fb.database().ref("players"),
		quotes: 	Fb.database().ref("quote")
	}

	logger.log('Public Firebase initialized!', logger.MESSAGE_TYPE.OK);
} else {
	logger.log('Public Firebase not initialized.', logger.MESSAGE_TYPE.Warn);
}

// ====================
// Bot Personas
// ====================
var mjPersona = new persona('Pocketbot', './assets/avatars/mj.png');
let mastabot = new persona('Pocketbot', './assets/avatars/mastabot.png');
let bookbot = new persona('Pocketbot', './assets/avatars/bookbot.png');
let bookbotCowboy = new persona('Last Man Standing', './assets/avatars/lms.png');

var globalCmdManager	= new command.CommandManager('d'),
	basicCmdGroup 		= new command.CommandGroup('basic', mastabot),
	ryionbotCmdGroup 	= new command.CommandGroup('ryionbot', mjPersona);

let matchCmdGroup 		= new command.CommandGroup('matchmake', mastabot),
	crownCmdGroup 		= new command.CommandGroup('crown', mastabot),
	quoteCmdGroup 		= new command.CommandGroup('quote', mastabot),
	communityCmdGroup 	= new command.CommandGroup('community', mastabot),
	keyCmdGroup 		= new command.CommandGroup('key', mastabot),
	adminCmdGroup 		= new command.CommandGroup('admin', mastabot),
	bookbotCmdGroup		= new command.CommandGroup('bookbot', bookbot),
	lmsCmdGroup			= new command.CommandGroup('lms', bookbotCowboy);


globalCmdManager.addGroup(basicCmdGroup);
globalCmdManager.addGroup(matchCmdGroup);
globalCmdManager.addGroup(crownCmdGroup);
globalCmdManager.addGroup(quoteCmdGroup);
globalCmdManager.addGroup(communityCmdGroup);
globalCmdManager.addGroup(keyCmdGroup);
globalCmdManager.addGroup(adminCmdGroup);
globalCmdManager.addGroup(ryionbotCmdGroup);
globalCmdManager.addGroup(bookbotCmdGroup);
globalCmdManager.addGroup(lmsCmdGroup);

// Clear the log file
logger.clearLogFile();

// Ready the user data
userdata = new userdata();
userdata.loadFromFile('./data/users.json');

// Parse the cmds dir and load any commands in there
fs.readdir(path.join(__dirname, 'cmds'), function(err, files){
	if(err){
		logger.log(err, logger.MESSAGE_TYPE.Error);
		return;
	}

	for(var i = 0; i < files.length; i++){
		let _cmds = require(path.join(__dirname, 'cmds', path.parse(files[i]).name)).commands;

		_cmds.forEach(function(element) {
			globalCmdManager.addCommand(element);
		}, this);
	}
});

// This stays a var. You change it back to let, we fight
var bot = new chat.Client({ token: TOKEN.TOKEN, autorun: true });

// May as well
bot.setPresence({game:{name: "Bot Simulator " + new Date().getFullYear()}});

// ===================================
// Bot Events
// ===================================

bot.on('ready', function(event) {
	logger.log("Bot logged in successfully.", logger.MESSAGE_TYPE.OK);
	helper.popCommand( globalCmdManager.cList );
});

bot.on('disconnect', function(err, errcode) {
	console.log(err, errcode);
	logger.log(`${err} (Error: ${errcode})`, logger.MESSAGE_TYPE.Error);
});

bot.on('presence', function(user, userID, state, game, event) {
	let statusData = {
		// Bot client object
		bot: bot,
		// Name of user who sent the message
		user: user,
		// ID of user who sent the message
		userID: userID,
		// Raw message string
		state: state,
		// Name of game being player OR stream title
		game: game
		// Raw event
		//e: event
	}

	status.onChange(statusData);
});

bot.on('message', function(user, userID, channelID, message, event){
	//Remove whitespace
	message = message.trim()

	//Split message into args
	let args = helper.getArgs(message);

	//Prepare command_data object
	var command_data = {
		//User data created by bots
		userdata: userdata,
		//Command manager
		commandManager: globalCmdManager,
		// Bot client object
		bot: bot,
		// Name of user who sent the message
		user: user,
		// ID of user who sent the message
		userID: userID,
		// ID of channel the message was sent in
		channelID: channelID,
		// ID of the server(guild)
		serverID: vars.chan,
		// ! -- bot.channels[channelID].guild_id Isn't correct
		//Raw message string
		message: message,
		// ID of the message sent
		messageID: event.d.id,
		// Array of arguments/words in the message
		args: args,
		// Reference to the Firebase DB's
		db: fire
	}

	// Dance Detector
	if ((message.includes('o') || message.includes('0')) && userID === "149541152322879489" ) {
		if ( message.includes('/') || message.includes('\\') || message.includes('<') || message.includes('>') ) {
			console.log("Dancer Detected");
			logger.log("Dancer Detected", logger.MESSAGE_TYPE.Warn);
			command_data.dance = event.d.id;
		}
	}

	// ===================================
	// ! -- TEMPORARY EMOTE INTERCEPT
	// ===================================
	if (message.startsWith(':')) {
		let msg = message;
		switch(msg) {
			case ":yourmother:":
				msg = ':yomama:'
				break;
			case ":patch17:":
				msg = ':schatzmeteor:'
				break;
		}

		if (vars.emotes.includes(msg)) {
			dio.del(event.d.id, command_data );
			console.log('Animated emote detected...');
			dio.sendImage('emoji/'+msg,user,{bot: bot},channelID);
		}

		return false;
	}

	// If from Mastabot, check for timed message otherwise ignore
	if (userID === vars.pocketbot) {
		if (message.includes("🕑")) helper.countdownMessage(event.d.id,message,channelID,5,bot);
		return false;
	}

	try {
		if (channelID === vars.modchan) {
			// Stop spying on us Freakspot.
		} else if (!(channelID in bot.directMessages)) {
			logger.log(`[#${bot.servers[vars.chan].channels[channelID].name}}] ${user}: ${message}`);
		} else {
			logger.log(`[DIRECT MESSAGE] ${user}: ${message}`);
		}

		if (message && globalCmdManager.isTrigger(args[0])){
			let cmdGroup = globalCmdManager.getGroup(globalCmdManager.getCommand(args[0]).groupName);

			// Personality Check
			if (globalCmdManager.activePersona != cmdGroup.personality) {
				cmdGroup.personality.set(command_data, function(){
					globalCmdManager.call(command_data, args[0]);
				});
				globalCmdManager.activePersona = cmdGroup.personality;
			} else {
				globalCmdManager.call(command_data, args[0]);
			}
		}
		userdata.saveToFile('./data/users.json');
	} catch(e) {
		bot.sendMessage({
			to: channelID,
			message: `An error occured inside the \`${args[0]}\` command code`
		});
		logger.log(`An error occured inside the \`${args[0]}\` command code: ${e.message}`, logger.MESSAGE_TYPE.Error);
		logger.log(`An error occured inside the \`${args[0]}\` command code: ${e.message}`, logger.MESSAGE_TYPE.Error, e);
	}
});
