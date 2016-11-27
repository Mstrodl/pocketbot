var logger  = require('../core/logger');
var command = require('../core/command').Command;
var helpers = require('../core/helpers');
var dio     = require('../core/dio');

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

var cmd_roll = new command('ryionbot', '!roll', 'Returns a random number within a given range (default range is [1, 6])', function(data){

    //If no range given, default to [1, 6]
    if(!data.args[1] || !data.args[2])
    {
        data.args[1] = 1;
        data.args[2] = 6;
    }

    var a = parseInt(data.args[1], 10);
    var b = parseInt(data.args[2], 10);

    //Check if a and b are number
    if(isNaN(a) || isNaN(b))
    {
        dio.say("Those are not number enough for me!", data);
        return;
    }

    if(b < a)
    {
        var aux = a;
        a = b;
        b = aux;
    }

    dio.say(Math.round(Math.random() * (b - a) + a).toString(), data);
});

var cmd_cointoss = new command('ryionbot', '!coin', 'Tosses a coin, result is Heads or Tails', function(data){
    dio.say(((Math.round(Math.random() * 300)) % 2 ? "Heads" : "Tails"), data);
});

module.exports.commands = [cmd_whois, cmd_iam, cmd_roll, cmd_cointoss];