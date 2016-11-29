/* ----------------------------------------
	This file controls all the stuff related
	to the Worthless Internet Point currency.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	helpers = require('../core/helpers'),
	dio     = require('../core/dio'),
	vars 	= require('../core/vars');

var cmd_wip = new command('economy', '!wip', 'Check or create your WIP account with the default WIP amount', function(data){
	let udata = data.userdata;

	// Oh snap, PROMISES.
	udata.getProp(data.userID, 'currency').then( (res) => {
		if( res || res === 0) {
			dio.say(`:bank: My records say you have **${res}** ${vars.emojis.wip} coins`, data);
		} else {
			let bank = udata.setProp({
				user: data.userID,
				prop: {
					name: currency,
					data: udata.DEFAULT_CURRENCY_AMOUNT
				}
			});

			dio.say(`<@${data.userID}>, your account has been added to my records. You now have ${bank} Worthless Internet Points™.`, data);
		}
	});
});

var cmd_transfer = new command('economy', '!transfer', 'Sends a user a certain amount of currency: `!transfer @recipient amount`, where amount > 0', function(data){
	if(!data.args[1] || !data.args[2]){
		dio.say('The command syntax is `!transfer @recipient amount`', data);
		return;
	}

	if(parseInt(data.args[2]) <= 0){
		dio.say('Amount cannot be negative or zero', data);
		return;
	}

	var recipient = helpers.getUser(data.args[1]);
	var amount = parseInt(data.args[2])

	data.userdata.transferCurrency(data.userID, recipient, amount).then( (res) => {
		if( res.hasOwnProperty('err') ){
			dio.say(res.err, data);
		}else{
			dio.say(`${amount} ${vars.emojis.wip} sent successfully`, data);
		}
	});
});

module.exports.commands = [cmd_wip, cmd_transfer];
