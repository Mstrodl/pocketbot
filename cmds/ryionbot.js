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

    var targetID = helpers.getUser(data.args[1]);
    if(targetID === "@everyone" || targertID === "@here") {
        data.bot.sendMessage({
            to: data.channelID,
            message: "Yeah. Nice try..."
        });
        return;
    }
    //Check if the user exists
    if(!targetID || !data.bot.users[targetID]){
        data.bot.sendMessage({
            to      : data.channelID,
            message : "User '" + data.args[1] + "' does not exist"
        });
        return;
    }

    //Check if the user has a description set
    data.userdata.getProp(targetID, 'description').then((res) => {
        if(!res){
            data.bot.sendMessage({
                to      : data.channelID,
                message : "No user description found for '" + data.args[1] + "'!"
            });
            return;
        }

        data.bot.sendMessage({
            to      : data.channelID,
            message : helpers.getNickFromId(targetID, data.bot)+ ': ' + res
        });
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
    if(data.args[1].indexOf(substring) !== -1) {
        data.bot.sendMessage({
            to: data.channelID,
            message: "Yeah. Nice try..."
        });
        return;
    }
    data.userdata.setProp({
        user: data.userID,
        prop: {
            name: 'description',
            data: data.args[1]
        }
    });

     data.bot.sendMessage({
        to      : data.channelID,
        message : data.user + ': ' + data.args[1]
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

    dio.say(Math.round(Math.random() * (b-a+1) + a-0.5).toString(), data);
});

var cmd_cointoss = new command('ryionbot', '!coin', 'Tosses a coin, result is Heads or Tails', function(data){
    dio.say(((Math.round(Math.random() * 300)) % 2 ? "Heads" : "Tails"), data);
});

var cmd_mstack_del = new command('ryionbot', '!purge', 'Deletes the last *n* messages', function(data){
    if(data.args.length != 2){
        throw new Error("Wrong number of arguments given to purge command");
    }

    var del_count = parseInt(data.args[1]);

    if(del_count <= 0){
        throw new Error("Number of messages cannot be negative or 0");
    }

    data.messageManager.Delete(del_count + 1, data.channelID, data);

    dio.say("<@" + data.userID + "> nuked the last " + del_count + " messages", data);
});

cmd_mstack_del.permissions = [helpers.vars.ranger, helpers.vars.mod];

var cmd_mstack_find = new command('ryionbot', '!findmessages', 'Retrieves a user\'s messages. This is mostly a debug command', function(data){
    if(data.args.length != 2){
        throw new Error("Wrong number of arguments given to purge command");
    }

    var targetID = helpers.getUser(data.args[1]);
    var messageArray = data.messageManager.GetUserMessages(targetID);

    dio.say(JSON.stringify(messageArray), data);
});

cmd_mstack_find.permissions = [helpers.vars.ranger, helpers.vars.mod];


module.exports.commands = [cmd_whois, cmd_iam, cmd_roll, cmd_cointoss, cmd_mstack_del, cmd_mstack_find];