var logger  = require('../core/logger');
var command = require('../core/command').Command;
var helpers = require('../core/helpers');
var dio     = require('../core/dio');
var vars 	= require('../core/vars')

var cmd_wip = new command('economy', '!wip', 'Check or create your WIP account with the default WIP ammount', function(data){
	if(!data.userdata.users[data.userID]) data.userdata.users[data.userID] = {};

	var res = data.userdata.getCurrency(data.userID);

	if(res || res === 0){
		dio.say(':bank: My records say you have **' + res + '** ' + vars.emojis.wip + ' coins', data, data.channelID);
	}else{
		data.userdata.setCurrency(data.userID, data.userdata.DEFAULT_CURRENCY_AMOUNT);
		dio.say('Your account has been added to my records, you now have ' + data.userdata.users[data.userID].currency + ' Worthless Internet Points', data, data.channelID);	
	}
});

var cmd_transfer = new command('economy', '!transfer', 'Sends a user a certain amount of currency: `!transfer @recipient amount`, where amount > 0', function(data){
	if(!data.args[1] || !data.args[2]){
		dio.say('The command syntax is `!transfer @recipient amount`', data, data.channelID);
		return;
	}

	if(parseInt(data.args[2]) <= 0){
		dio.say('Amount cannot be negative or zero', data, data.channelID);
		return;
	}

	var recipient = helpers.getUser(data.args[1]);
	var amount = parseInt(data.args[2])

	data.userdata.transferCurrency(data.userID, recipient, amount, function(err, tdata){
		if(err){
			dio.say(err, data);
		}else{
			dio.say(amount + ' sent successfully', data);
		}
	});
});

module.exports.commands = [cmd_wip, cmd_transfer];