/* ----------------------------------------
	This file contains the basic example of
	a new command file. Also the !help
 ---------------------------------------- */

let logger  		= require('../core/logger'),
	command 		= require('../core/command').Command,
	commandSystem   = require('../core/command'),
	helpers 		= require('../core/helpers');

let cmd_ping = new command('basic', '!ping', 'Test command #1', function(data){
	data.bot.sendMessage({
		to		: data.channelID,
		message : "Pong!"
	});
});

cmd_ping.permissions = [helpers.vars.admin];

var cmd_ding = new command('ryionbot', '!ding', 'Test command #2', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Dong <:nguyen:230394513560961024>"
    });
});

cmd_ding.triggerType = commandSystem.TriggerType.InMessage;

let cmd_help = new command('ryionbot', '!help', 'Sends the user a list of all command groups for further info', function(data){
    let k = (data.args[1]) ? data.args[1] : null;

    let helpText = "";
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
        for(let gk in data.commandManager.groups){
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
