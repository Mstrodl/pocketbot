var logger  = require('../core/logger');
var command = require('../core/command').Command;

var cmd_ping = new command('basic', '!ping', 'Test command #1', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Pong"
    });
});

var cmd_ding = new command('ryionbot', '!ding', 'Test command #2', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Dong"
    });
});

var cmd_help = new command('ryionbot', '!help', 'Help command', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : data.commandManager.getHelp()
    });
});


module.exports.commands = [cmd_ping, cmd_ding, cmd_help];