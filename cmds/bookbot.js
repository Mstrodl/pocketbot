var logger  = require('../core/logger');
var command = require('../core/command').Command;

var cmd_ping = new command('bookbot', '!patch', 'See the most recent changes to the game.', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : ""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		""+
		
		"Most recent Documented Changes (8/8/16):\n"+
		"<http://blog.pocketwatchgames.com/post/150743867811/tooth-and-tail-patch-notes-pre-alpha-19>\n"
    });
});

var cmd_ding = new command('bookbot', '!newspaper', 'Read the most recent issue of the Weekly Warren.', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "The Warren Weekly is a newspaper written by Glyde in the Tooth and Tail universe explaining certain changes noted in the most recent patch notes. \n\n"+
		"Issue 9: http://bit.ly/2dgEmU6\n"+
		"Issue 7: <http://bit.ly/2aT5dGI>\n"+
		"Issue 6: <http://bit.ly/29wcywy>\n"+
		"Issue 5: <http://bit.ly/29Yz5TG>\n"+
		"Issue 4: <http://bit.ly/2aaf7BK>\n"+
		"Issue 3: <http://bit.ly/29JQD3Z>\n"+
		"Issue 2: <http://bit.ly/29SLMfC>\n"+
		"Issue 1: <http://bit.ly/29EtwWM>"
    });
});

var cmd_help = new command('bookbot', '!troubleshoot', 'problem with getting the game started?', function(data){
    data.bot.sendMessage({
        to      : data.channelID,
        message : "If your game is acting weird, here's a few things you can try to remedy that.:\n"+
		"__Game starts in top left corner:\nMenu UI doesn't show up:__\nGo to \"%AppData%\\ToothAndTail\\Options.xml\" or \"~/.config/ToothAndTail/Options.xml\" (if you're on mac) and change the parameter in ResolutionHeight to 1080.\n"+
		"__Can't see game lobby__:\nThere is a text bug that partially hides the first lobby in the lobby list if your resolution is not of a 16:9 ratio. Try chaning your resolution to either 1920x1080, 1600x900, etc. in the path mentioned above. Restart your game afterwards.\n"+
		"__Steam crashes__:\nThis may be a problem with AVG or Avast. To play the game you can either temporarily disable the anti-virus program, or add \"C:\\Program Files (x86)\\Steam\\steamapps\\common\\ToothAndTail\" this folder to the program's exemptions.\n"+
		"__Cannot add Bots to Splitscreen__:\nIn the options.xml file, Add \"<DefaultPersonality>basic</DefaultPersonality>\" to your options file. Add bots should work after that."
    });
});


module.exports.commands = [cmd_ping, cmd_ding, cmd_help];