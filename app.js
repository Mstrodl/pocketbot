"use strict"

// Get the libs
let chat = require('discord.io'),
	Fb = require("firebase"),
	shot = require("webshot"), // ! -- what is this for?
	fs = require('fs'),
	gm = require('gm').subClass({ imageMagick: true }),
	wc = require('node-wolfram'),
	logger = require('./core/logger'),
	steam = require('steam-webapi');

// Modules
let TOKEN = require('./core/tokens'),
	vars = require('./core/vars');
	// insert a thing for the rest of commands in './cmds/'

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

// ! -- Probably doesn't work yet...
let bot = new chat.Client({ token: "MjM2NTM3ODM3NzI4Njk0Mjgy.CuKmcg.ES1nrRi28OwB3AWUNS7rCfa1-Iw", autorun: true });

bot.on('ready', function(event) {
    logger.log("Bot logged in successfully.", logger.MESSAGE_TYPE.Info);
});
