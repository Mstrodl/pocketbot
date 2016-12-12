/* ----------------------------------------
	Port of most the Bookbot code
 ---------------------------------------- */

let logger  = require('../core/logger'),
	dio		= require('../core/dio'),
	x		= require('../core/vars'),
	command = require('../core/command').Command
	stripIndents = require('common-tags').stripIndents;

let cmd_patch = new command('bookbot', '!patch', 'See the most recent changes to the game', function(data){
	dio.say(""+
		// I love this.
		"Most recent Documented Changes (11/15/16):\n"+
		"<http://blog.pocketwatchgames.com/post/153237321651>\n", data);
});

let cmd_newspaper = new command('bookbot', '!newspaper', 'Read the most recent issue of the Weekly Warren', function(data){
	data.bot.sendMessage({
		to: data.channelID,
		embed: {
			title: `The Warren Weekly`,
			color: '8281503',
			description: `The Warren Weekly is a newspaper written by Glyde in the Tooth and Tail universe explaining certain changes noted in the most recent patch notes.`,
			fields: [
				{
					name: `Issue 12`,
					value: `[Read the latest issue of the Warren Weekly](http://bit.ly/2hjxude)`,
					inline: false
				},
				{
					name: `Issue 11`,
					value: `[Read an archived issue](http://bit.ly/2fbgODo)`,
					inline: true
				},
				{
					name: `Issue 9`,
					value: `[Read an archived issue](http://bit.ly/2dgEmU6)`,
					inline: true
				},
				{
					name: `Issue 7`,
					value: `[Read an archived issue](http://bit.ly/2aT5dGI)`,
					inline: true
				},
				{
					name: `Issue 6`,
					value: `[Read an archived issue](http://bit.ly/29wcywy)`,
					inline: true
				},
				{
					name: `Issue 5`,
					value: `[Read an archived issue](http://bit.ly/29Yz5TG)`,
					inline: true
				},
				{
					name: `Issue 4`,
					value: `[Read an archived issue](http://bit.ly/2aaf7BK)`,
					inline: true
				},
				{
					name: `Issue 3`,
					value: `[Read an archived issue](http://bit.ly/29JQD3Z)`,
					inline: true
				},
				{
					name: `Issue 2`,
					value: `[Read an archived issue](http://bit.ly/29SLMfC)`,
					inline: true
				},
				{
					name: `Issue 1`,
					value: `[Read an archived issue](http://bit.ly/29EtwWM)`,
					inline: true
				}
			],
			footer: {
				text: `Last issue published on 11th December`
			}
		},
	});
});

let cmd_troubleshoot = new command('bookbot', '!troubleshoot', 'Troubleshoot common errors', function(data){
	if (data.args[1] == null) {
		dio.say(stripIndents`
			What seems to be the trouble with your game? Type in '!troubleshoot #' by choosing an option below:
			
			:one: Game starts in top left corner OR Menu UI doesn't show
			:two: Can't see game lobby
			:three: Steam crashes
			:four: Cannot add Bots to Splitscreen
			:five: Other`, data);
	} else {
		let k = data.args[1];
		let res;
		switch (k) {
			case ":one:":
			case "1":
				res = "**Game starts in top left corner OR Menu UI doesn't show**\nGo to `%AppData%\\ToothAndTail\\Options.xml` (Windows) or `~/.config/ToothAndTail/Options.xml` (Linux/Mac) and change the parameter in ResolutionHeight to 1080."
				break;
			case ":two:":
			case "2":
				res = `**Can't see game lobby**\nThere is a text bug that partially hides the first lobby in the lobby list if your resolution is not of a 16:9 ratio. Try changing your resolution to either 1920x1080, 1600x900, etc. in your options.xml. Restart your game afterwards.`
				break;
			case ":three:":
			case "3":
				res = "**Steam crashes**\nThis may be a problem with AVG or Avast. To play the game you can either temporarily disable the anti-virus program, or add `C:\\Program Files (x86)\\Steam\\steamapps\\common\\ToothAndTail\\` to the program's exemptions."
				break;
			case ":four:":
			case "4":
				res = `**Cannot add Bots to Splitscreen**\nIn the options.xml file, add \`<DefaultPersonality>basic</DefaultPersonality>\` to your options file. Adding bots should work after that.`
				break;
			case ":five:":
			case "5":
				res = `**Other**\nFor any other problems, report your problem in <#${x.trouble}>.`
				break;
		}

		dio.say(res, data);
	}
});

let cmd_guide = new command('bookbot', '!guide', 'Get a useful list of guides for the game', function(data){
	data.bot.sendMessage({
		to: data.channelID,
		embed: {
			title: `Guides`,
			color: '8281503',
			description: `If you're new to the game, this is a great place to start and I hope by the end of this, you'll have a solid understanding of Tooth and Tail and be better equipped with knowledge to win your battles.`,
			fields: [
				{
					name: `Introduction: A basic guide`,
					value: `[Link to Lacante's Video](https://www.youtube.com/watch?v=w8Y2gdrgpUA)`,
					inline: false
				},
				{
					name: `The Commander and You`,
					value: `[Link (written by Glyde)](https://toothandtailwiki.com/guides/glydes-beginner-guide/)`,
					inline: true
				},
				{
					name: `Knowing the Battlefield`,
					value: `[Link (written by Glyde)](https://toothandtailwiki.com/guides/glydes-beginner-guide/2)`,
					inline: true
				},
				{
					name: `Economics of War`,
					value: `[Link (written by Glyde)](https://toothandtailwiki.com/guides/glydes-beginner-guide/3)`,
					inline: true
				},
				{
					name: `Meet your Comrades`,
					value: `[Link (written by Glyde)](https://toothandtailwiki.com/guides/glydes-beginner-guide/4)`,
					inline: true
				},
				{
					name: `The Subtleties of Battle`,
					value: `[Link (written by Glyde)](https://toothandtailwiki.com/guides/glydes-beginner-guide/5)`,
					inline: true
				},
				{
					name: `Unit Overview`,
					value: `[Link to Shooflypi's video](https://toothandtailwiki.com/guides/glydes-beginner-guide/5)`,
					inline: true
				}
			]
		}
	});
});

let cmd_coc = new command('bookbot', '!coc', 'Get Information on **Clash of Comrades**', function(data) {	
	data.bot.sendMessage({
		to: data.channelID,
		embed: {
			title: `<:tntwolf:253730191556214795> **Clash of Comrades** <:tntwolf:253730191556214795>`,
			color: '8281503',
			description: `Clash of Comrades is a bi-monthly tournament for players of the game Tooth and Tail with the aim of friendly competition and the development of the game!`,
			url: 'http://clashofcomrades.com',
			fields: [
				{
					name: `Rules & more`,
					value: `[Read about the rules on facebook](https://www.facebook.com/ClashOfComrades)`,
					inline: false
				},
				{
					name: `Latest Brackets`,
					value: `[Find the latest brackets on challonge](http://challonge.com/cocnovemberknockout)`,
					inline: false
				},
				{
					name: `YouTube`,
					value: `[Find Clash of Comrades on YouTube](https://www.youtube.com/channel/UCesgJAY8oYO9xxX_wR22WBg)`,
					inline: true
				},
				{
					name: `Twitch`,
					value: `[Find Clash of Comrades on Twitch](https://www.twitch.tv/clashofcomrades)`,
					inline: true
				}
			]
		}
	});
});

let cmd_bookbot = new command('bookbot', '!bookbot', 'Read up on Bookbot', function(data) {
	dio.say(`Bookbot was a bot created by Glyde Borealis that used to be of great service for this community. His soul lives on in Pocketbot.`, data);
});

module.exports.commands = [cmd_patch, cmd_newspaper, cmd_troubleshoot, cmd_guide, cmd_coc, cmd_bookbot];
