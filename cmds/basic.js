let logger  = require('../core/logger');
let command = require('../core/command').Command;

let cmd_ping = new command('basic', '!ping', function(data){
    data.client.sendMessage({
        to      : data.channelID,
        message : "Pong"
    });
});


module.exports.commands = [cmd_ping];