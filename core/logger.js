var fs = require('fs');
var chalk = require('chalk');

var logFile = 'log.txt';

var MESSAGE_TYPE = {
	Info: 0,
	OK: 1,
	Warn: 2,
	Error: 3
};

module.exports.MESSAGE_TYPE = MESSAGE_TYPE;

module.exports.clearLogFile = function(){
	fs.writeFileSync(logFile, "");
}

module.exports.log = function(msg, type=0, err=null){
	var final_msg = "";

	switch(type){
		case 1:
		case 'OK':
		case MESSAGE_TYPE.OK:
			final_msg = chalk.green('[OK] ' + msg);
			break;
		case 2:
		case 'Warn':
		case MESSAGE_TYPE.Warn:
			final_msg = chalk.yellow('[WARN] ' + msg);
			break;
		case 3:
		case 'Error':
		case MESSAGE_TYPE.Error:
			//final_msg = chalk.red('[ERROR] ' + msg);
			if(err){
				//final_msg += '\n' + err.stack;
				final_msg = chalk.red('[ERROR] ' + err.stack);
			}
			break;
		case 0:
		case 'Info':
		case MESSAGE_TYPE.Info:
		default:
			final_msg = '[INFO] ' + msg;
			break;
	}

	console.log(final_msg);

	fs.appendFile(logFile, final_msg + '\n', function(err){
		if(err){
			//Error logging threw an error. Panic
			console.log(chalk.red('[ERROR] Failed to log error:\n' + err));
		}
	});
}
