var logger  = require('../core/logger');
var command = require('../core/command').Command;
var helpers = require('../core/helpers');
var dio     = require('../core/dio');

var cmd_wip = new command('economy', '!wip', 'Check or create your WIP account with the default WIP ammount', function(data){
	if(!data.userdata.users[data.userID]) data.userdata.users[data.userID] = {};

	var res = data.userdata.getCurrency(data.userID);

	if(res || res === 0){
		dio.say('My records say you have ' + res + ' Worthless Internet Points', data, data.channelID);
	}else{
		data.userdata.setCurrency(data.userID, data.userdata.DEFAULT_CURRENCY_AMOUNT);
		dio.say('Your account has been added to my records, you now have ' + data.userdata.users[data.userID].currency + ' Worthless Internet Points', data, data.channelID);	
	}
});

var cmd_transfer = new command('economy', '!transfer', 'Sends a user a certain amount of currency: `!transfer @recipient amount`, where amount > 0', function(data){
	if(!data.args[1] || !data.args[2] || parseInt(data.args[2] <= 0)){
		dio.say('The command syntax is `!transfer @recipient amount`', data, data.channelID);
		return;
	}

	var recipient = helpers.getUser(data.args[1]);
	var amount = parseInt(data.args[2])

	if(data.userdata.transferCurrency(data.userID, recipient, amount)){
		dio.say('Transferred ' + amount + '. Use **!checkip** to make sure the funds transferred successfully', data, data.channelID);
	}else{
		dio.say('Something went wrong. Make sure ' + data.args[1] + ' exists, that you have enough points and that they have an open account(they need to execute **!resetwip** if they don\'t)', data, data.channelID);
	}
});

module.exports.commands = [cmd_wip, cmd_transfer];