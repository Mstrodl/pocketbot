var logger  = require('../core/logger');
var command = require('../core/command').Command;
var helpers = require('../core/helpers');

var cmd_whois = new command('ryionbot', '!whois', 'Displays a user\'s self written short description', function(data){
    //Check if the a username was given
    if(data.args.length != 2){
        data.bot.sendMessage({
            to      : data.channelID,
            message : "A single username is needed for `!whois <username>`"
        });
        return;
    }

    var targetID = helpers.getIDFromName(data.bot, data.args[1]);
    //var targetID = data.userID;

    //Check if the user exists
    if(!targetID || !data.bot.users[targetID]){
        data.bot.sendMessage({
            to      : data.channelID,
            message : "User '" + data.args[1] + "' does not exist"
        });
        return;
    }

    //Check if the user has a description set
    if(!data.userdata.users[targetID] || !data.userdata.users[targetID].description){
        data.bot.sendMessage({
            to      : data.channelID,
            message : "No user description found for '" + data.args[1] + "'!"
        });
        return;
    }

    data.bot.sendMessage({
        to      : data.channelID,
        message : data.args[1] + ': ' + data.userdata.users[targetID].description
    });
});

var cmd_iam = new command('ryionbot', '!iam', 'Sets a short description for yourself', function(data){
    //Check if the a username was given
    if(data.args.length != 2){
        data.bot.sendMessage({
            to      : data.channelID,
            message : "Wrong number of arguments. Syntax is `!iam \"description\"`"
        });
        return;
    }

    if(!data.userdata.users[data.userID]){
        data.userdata.users[data.userID] = {description: data.args[1]};
    }else{
        data.userdata.users[data.userID].description = data.args[1];
    }
    data.bot.sendMessage({
        to      : data.channelID,
        message : data.user + ": " + data.userdata.users[data.userID].description
    });
});

module.exports.commands = [cmd_whois, cmd_iam];