var logger  = require('../core/logger');
var command = require('../core/command').Command;

var cmd_ping = new command('basic', '!ping', 'Test command #1', function(data){
	data.bot.sendMessage({
		to	  : data.channelID,
		message : "Pong!"
	});
});

var cmd_ding = new command('ryionbot', '!ding', 'Test command #2', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Dong"
    });
});

var cmd_help = new command('ryionbot', '!help', 'Help command', function(data){
    let k = (data.args[1]) ? data.args[1] : null;
    data.bot.sendMessage({
        to      : data.userID,
        message : data.commandManager.getHelp(k) // passes the given trigger
    });
    if (!(data.channelID in data.bot.directMessages)) {
        data.bot.sendMessage({
            to      : data.channelID,
            message : `I have messaged you the full list of commands, <@${data.userID}> :thumbsup:`
        });
    }
});

module.exports.commands = [cmd_ping, cmd_ding, cmd_help];
