var logger  = require('../core/logger');
var command = require('../core/command').Command;
var helpers = require('../core/helpers');

var cmd_ping = new command('basic', '!ping', 'Test command #1', function(data){
	data.bot.sendMessage({
		to	  : data.channelID,
		message : "Pong!"
	});
});

var cmd_ding = new command('ryionbot', '!ding', 'Test command #2', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Dong <:nguyen:230394513560961024>"
    });
});

var cmd_help = new command('ryionbot', '!help', 'Help command', function(data){
    let k = (data.args[1]) ? data.args[1] : null;

    var helpText = "";
    if(k == null){
        helpText = data.commandManager.getHelp('bork', 'all');
        data.bot.sendMessage({
            to      : data.userID,
            message : helpText
        });
        return;
    }else if(data.commandManager.getCommand(k)){
        helpText = data.commandManager.getHelp(k, 'command');
    }else{
        for(var gk in data.commandManager.groups){
            if(k == gk){
                helpText = data.commandManager.getHelp(k, 'group');
            }
        }
    }

    data.bot.sendMessage({
            to      : data.channelID,
            message : helpText
        });
        return;
});

module.exports.commands = [cmd_ping, cmd_ding, cmd_help];
