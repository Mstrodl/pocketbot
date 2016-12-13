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
	dio 		= require('./core/dio'),
	messageManager = require('./core/messages');

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

	// Ready the user data
	userdata = new userdata(fire.soldiers);
	userdata.load(); // ! -- Might be unneeded?

	logger.log('Public Firebase initialized!', logger.MESSAGE_TYPE.OK);
} else {
	logger.log('Public Firebase not initialized.', logger.MESSAGE_TYPE.Warn);
}

// ====================
// Bot Personas
// ====================
let mjPersona = new persona('Pocketbot', './assets/avatars/mj.png', vars.emojis.ryionbot),
	mastabot = new persona('Pocketbot', './assets/avatars/mastabot.png', vars.emojis.mastabot),
	bookbot = new persona('Pocketbot', './assets/avatars/bookbot.png', vars.emojis.bookbot),
	bookbotCowboy = new persona('Last Man Standing', './assets/avatars/lms.png', vars.emojis.bookbot),
	unitinfo = new persona('Pocketbot', './assets/avatars/mastabot.png', vars.emojis.pocketbot),
	lucille = new persona('Pocketbot', './assets/avatars/lucille.png', vars.emojis.lucille);

// Manager and Groups
let globalCmdManager	= new command.CommandManager('d'),
	basicCmdGroup 		= new command.CommandGroup('basic', mastabot, 'Basic commands'),
	ryionbotCmdGroup 	= new command.CommandGroup('ryionbot', mjPersona, 'Commands brought to you by RyionBot'),
	ryionbot_ecoCmdGroup= new command.CommandGroup('economy', mjPersona, 'RyionBot\'s currency system commands'),
	matchCmdGroup 		= new command.CommandGroup('matchmake', mastabot, 'Handles all the matchmaking commands'),
	crownCmdGroup 		= new command.CommandGroup('crown', mastabot, 'Handles "Crown" minigame commands'),
	quoteCmdGroup 		= new command.CommandGroup('quote', mastabot, 'Let\'s you interface with the quoting system'),
	communityCmdGroup 	= new command.CommandGroup('community', mastabot, 'All the basic, most-used community chat commands'),
	keyCmdGroup 		= new command.CommandGroup('key', mastabot, 'Alpha tester onboarding commands'),
	adminCmdGroup 		= new command.CommandGroup('admin', mastabot, 'Admin/Mod only commands'),
	bookbotCmdGroup		= new command.CommandGroup('bookbot', bookbot, 'Informational commands'),
	lmsCmdGroup			= new command.CommandGroup('lms', bookbotCowboy, 'Commands for Last Man Standing, a chat minigame made by Glyde'),
	infoCmdGroup		= new command.CommandGroup('unitinfo', unitinfo, 'Unit/Trait Information command'),
	streamCmdGroup		= new command.CommandGroup('streaming', mastabot, 'Twitch stream related commands'),
	lucilleCmdGroup 	= new command.CommandGroup('lucille', lucille, 'Lucille gives us the latest tweets.');

globalCmdManager.addGroup(basicCmdGroup);
globalCmdManager.addGroup(matchCmdGroup);
globalCmdManager.addGroup(crownCmdGroup);
globalCmdManager.addGroup(quoteCmdGroup);
globalCmdManager.addGroup(communityCmdGroup);
globalCmdManager.addGroup(keyCmdGroup);
globalCmdManager.addGroup(adminCmdGroup);
globalCmdManager.addGroup(ryionbotCmdGroup);
globalCmdManager.addGroup(ryionbot_ecoCmdGroup);
globalCmdManager.addGroup(bookbotCmdGroup);
globalCmdManager.addGroup(lmsCmdGroup);
globalCmdManager.addGroup(infoCmdGroup);
globalCmdManager.addGroup(streamCmdGroup);
globalCmdManager.addGroup(lucilleCmdGroup);

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
			globalCmdManager.addCommand(element);
		}, this);
	}
});

logger.log(`Debug mode: ${helper.isDebug()}`, logger.MESSAGE_TYPE.Info);
logger.log(`Running on Heroku: ${helper.isHeroku() ? 'true' : 'false'}`, logger.MESSAGE_TYPE.Info);

// This stays a var. You change it back to let, we fight
var bot = new chat.Client({ token: TOKEN.TOKEN, autorun: true });

//Init the messageManager
var globalMessageManager = new messageManager.MessageManager();
globalMessageManager.AddChannels(bot);

// ===================================
// Bot Events
// ===================================

bot.on('ready', function(event) {
	logger.log("Bot logged in successfully.", logger.MESSAGE_TYPE.OK);
	helper.popCommand( globalCmdManager.cList );

	// Work around to giving Lucille bot/persona info!
	if (helper.isHeroku() ) dio.say( `!lucille`, { bot: bot, channelID: vars.testing } );
});

bot.on('disconnect', function(err, errcode) {
	console.log(err, errcode);
	logger.log(`${err} (Error: ${errcode})`, logger.MESSAGE_TYPE.Error);

	bot.connect();
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
		game: game,
		// Reference to the Firebase DB's
		db: fire,
		// Raw event
		e: event
	}

	if (fire) status.onChange(statusData, userdata);
});

bot.on('message', function(user, userID, channelID, message, event) {
	//console.log(`${user} : ${bot.servers[vars.chan].members[userID].roles}`) // Quick role
	//console.log(`${message}`) // Message check

	//Remove whitespace
	message = helper.collapseWhitespace(message);

	//Split message into args
	let args = helper.getArgs(message);

	//Prepare command_data object
	let command_data = {
		//User data created by bots
		userdata: userdata,
		//Command manager
		commandManager: globalCmdManager,
		//Message manager
		messageManager: globalMessageManager,
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
			console.log('Special emote detected...');
			dio.sendImage('emoji/'+msg,user,{bot: bot},channelID);
		}

		return false;
	}

	// If from Mastabot, check for timed message or tweet stuff otherwise ignore
	if (userID === vars.pocketbot) {
		if (message.includes("🕑")) {
			helper.countdownMessage(event.d.id,message,channelID,5,bot);
		} else if (message.includes("!tweet") || message.includes("!lucille")) {
			// Do nothing
		} else {
			return false;
		}
	}

	try {
		if (channelID === vars.modchan) {
			// Stop spying on us Freakspot.
		} else if (!(channelID in bot.directMessages)) {
			if ( helper.isDebug() ) logger.log(`[#${bot.servers[vars.chan].channels[channelID].name}] ${user}: ${message}`);
		} else {
			logger.log(`[DIRECT MESSAGE] ${user}: ${message}`);
		}

		let cmd_trigger = globalCmdManager.isTrigger(args);

		if (message && cmd_trigger){
			let cmd = globalCmdManager.getCommand(args);
			let cmdGroup = globalCmdManager.getGroup(cmd.groupName);

			command_data.trigger = cmd_trigger;

			// Personality Check
			if (globalCmdManager.activePersona != cmdGroup.personality) {
				cmdGroup.personality.set(command_data, function(){
					globalCmdManager.call(command_data, cmd, cmdGroup);
				});
				globalCmdManager.activePersona = cmdGroup.personality;
			} else {
				globalCmdManager.call(command_data, cmd, cmdGroup);
			}
		}else{
			return;
		}
	} catch(e) {
		bot.sendMessage({
			to: channelID,
			message: `An error occured while looking up or trying to call \`${args[0]}\``
		});
		logger.log(`An error occured while looking up or trying to call \`${args[0]}\``, logger.MESSAGE_TYPE.Error, e);
	}

	globalMessageManager.Push(command_data.messageID, command_data.channelID);
});
