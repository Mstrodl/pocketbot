var logger  = require('../core/logger');
var command = require('../core/command').Command;
var helpers = require('../core/helpers');
var dio     = require('../core/dio');

var cmd_reset = new command('economy', '!resetwip', 'Resets your WIP amount to the default value', function(data){
	data.userdata.setCurrency(data.userID, data.userdata.DEFAULT_CURRENCY_AMOUNT);
	dio.say('According to my records, you have ' + data.userdata.users[data.userID].currency + ' Worthless Internet Points', data, data.channelID);	
});

var cmd_check = new command('economy', '!checkwip', 'Check your currency account balance', function(data){
	var res = data.userdata.getCurrency(data.userID);

	if(res || res === 0){
		dio.say('You have ' + res + ' Worthless Internet Points', data, data.channelID);
	}else{
		dio.say('I can\'t seem to find you in the user records...Try **!resetwip** first', data, data.channelID);
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
		dio.say('Something went wrong. Make sure ' + data.args[1] + ' exists and that they have an open account(they need to execute **!resetwip** if they don\'t)', data, data.channelID);
	}
});

module.exports.commands = [cmd_reset, cmd_check, cmd_transfer];