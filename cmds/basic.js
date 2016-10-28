var logger  = require('../core/logger');
var command = require('../core/command').Command;

var cmd_ping = new command('basic', '!ping', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Pong"
    });
});

var cmd_ding = new command('mj', '!ding', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "Dong"
    });
});


module.exports.commands = [cmd_ping, cmd_ding];