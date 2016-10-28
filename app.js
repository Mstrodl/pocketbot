"use strict"

// Get the libs
let chat 	= require('discord.io'),
	path 	= require('path'),
	Fb 		= require("firebase"),
	shot 	= require("webshot"), // ! -- what is this for?
	fs 		= require('fs'),
	gm 		= require('gm').subClass({ imageMagick: true }),
	wc 		= require('node-wolfram'),
	steam 	= require('steam-webapi');

// Modules
let TOKEN 	= require('./core/tokens'),
	command = require('./core/command'),
	logger 	= require('./core/logger'),
	persona = require('./core/personality'),
	helper	= require('./core/helpers'),
	vars 	= require('./core/vars');

var defaultPersona	= new persona('Masta\'s Face', './assets/avatars/masta.png');
var mjPersona = new persona('MJ Bot', './assets/avatars/mj.png')

var globalCommandManager	= new command.CommandManager();
var basicCommandGroup 		= new command.CommandGroup('basic', defaultPersona);
var mjCommandGroup 			= new command.CommandGroup('mj', mjPersona);

globalCommandManager.addGroup(basicCommandGroup);
globalCommandManager.addGroup(mjCommandGroup);

//Clear the log file
logger.clearLogFile();

//Parse the cmds dir and load any commands in there
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

// Initialize Firebase Stuff
// ! -- Modularize it too?
/*
let config = {
	apiKey: FBKEY,
	authDomain: "ltf-alpha-keys.firebaseapp.com",
	databaseURL: "https://ltf-alpha-keys.firebaseio.com",
	storageBucket: "ltf-alpha-keys.appspot.com",
	serviceAccount: "ltf.json"
 };

Fb.initializeApp(config);

let soldiers = Fb.database().ref("players"),
	scrims = Fb.database().ref("battles"),
	ranks = Fb.database().ref("ranks"),
	emails = Fb.database().ref("email"),
	keys = Fb.database().ref("key"),
	quotes = Fb.database().ref("quote");
*/

//This stays a var. You change it back to let, we fight
var bot = new chat.Client({ token: "GETAFUCKINGTOKENALREADY", autorun: true });

bot.on('ready', function(event) {
    logger.log("Bot logged in successfully.", logger.MESSAGE_TYPE.OK);
});

bot.on('message', function(user, userID, channelID, message, event){
	//Remove whitespace
	message = message.trim()

	//Split message into args
	var args = helper.getArgs(message);

	//Prepare command_data object
	var command_data = {
		//Bot client object
		bot: bot,
		//Name of user who sent the message
		user: user,
		//ID of user who sent the message
		userID: userID,
		//ID of channel the message was sent in
		channelID: channelID,
		//Raw message string
		message: message,
		//Array of arguments/words in the message
		args: args
	}

	try{
		logger.log(user + ": " + message);
		if(globalCommandManager.isTrigger(args[0])){
			globalCommandManager.getGroup(globalCommandManager.getCommand(args[0]).groupName).personality.set(command_data);
			//We need a delay so Discord can update bot data in time
			setTimeout(function(){globalCommandManager.call(command_data, args[0]);}, 400);
			//defaultPersona.set(bot);
		}
	}catch(e){
		logger.log(e.message, logger.MESSAGE_TYPE.Error);
	}
});