var fs = require('fs');
var chalk = require('chalk');

var logFile = 'log.txt';

module.exports.MESSAGE_TYPE = {
    Info = 0,
    OK = 1,
    Warn = 2,
    Error = 3
};

module.exports.clearLogFile = function(){
    fs.writeFileSync(logFile, "");
}

module.exports.log = function(msg, type=0){
    var final_msg = "";

    switch(type){
        case MESSAGE_TYPE.Info:{
            final_msg = '[INFO]' + msg;
        }
        case MESSAGE_TYPE.OK:{
            final_msg = chalk.green('[OK]' + msg);
        }
        case MESSAGE_TYPE.Warn:{
            final_msg = chalk.yellow('[WARN]' + msg);
        }
        case MESSAGE_TYPE.Error:{
            final_msg = chalk.red('[ERROR]' + msg);
        }
    }

    console.log(final_msg);
    
    fs.appendFile(logFile, final_msg, function(err){
        //Error logging threw an error. Panic
        console.log(chalk.red('[ERROR] Failed to log error:\n' + err));
    });
}