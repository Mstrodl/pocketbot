/* ----------------------------------------
	Port of most the Bookbot code
 ---------------------------------------- */

let logger  = require('../core/logger'),
	dio		= require('../core/dio'),
	x		= require('../core/vars'),
	command = require('../core/command').Command;

let cmd_patch = new command('bookbot', '!patch', 'See the most recent changes to the game', function(data){
	dio.say(""+
		// I love this.
		"Most recent Documented Changes (8/8/16):\n"+
		"<http://blog.pocketwatchgames.com/post/150743867811/tooth-and-tail-patch-notes-pre-alpha-19>\n", data);
});

let cmd_newspaper = new command('bookbot', '!newspaper', 'Read the most recent issue of the Weekly Warren', function(data){
	dio.say("The Warren Weekly is a newspaper written by Glyde in the Tooth and Tail universe explaining certain changes noted in the most recent patch notes. \n\n"+
		"Issue 9: http://bit.ly/2dgEmU6\n"+
		"Issue 7: <http://bit.ly/2aT5dGI>\n"+
		"Issue 6: <http://bit.ly/29wcywy>\n"+
		"Issue 5: <http://bit.ly/29Yz5TG>\n"+
		"Issue 4: <http://bit.ly/2aaf7BK>\n"+
		"Issue 3: <http://bit.ly/29JQD3Z>\n"+
		"Issue 2: <http://bit.ly/29SLMfC>\n"+
		"Issue 1: <http://bit.ly/29EtwWM>", data);
});

let cmd_troubleshoot = new command('bookbot', '!troubleshoot', 'Troubleshoot common errors', function(data){
	if (data.args[1] == null) {
		dio.say(`What seems to be the trouble with your game? Type in '!troubleshoot #' by choosing an option below:

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
	dio.say("Ah, hello there, if you're new to the game, this is a great place to start and I hope by the end of this, you'll have a solid understanding of Tooth and Tail and be better equipped with knowledge to win your battles.\n\n"+

		"**0) Introduction: A basic guide (Courtesy of Lacante)**\n"+
		"<https://www.youtube.com/watch?v=w8Y2gdrgpUA>\n"+
		"**1) The Commander and You: Understanding What You Can Do**\n"+
		"<https://www.reddit.com/r/ToothAndTail/comments/4l4c8k/tooth_and_tail_guide_chapter_1_the_commander_and/>\n"+
		"**2) Knowing the Battlefield: Understanding and Utilizing the Map**\n"+
		"<https://www.reddit.com/r/ToothAndTail/comments/4lzmn3/tooth_and_tail_guide_chapter_2_knowing_the/>\n"+
		"**3) The Economics of Battle: Food for the Army, Army for the Food**\n"+
		"<https://www.reddit.com/r/ToothAndTail/comments/4n9ji5/tooth_and_tail_guide_chapter_3_economics_of_war/>\n"+
		"**3.5) The Time and Tempo of Battle: Opening Build Orders (Courtesy of Shooflypi)**\n"+
		"<https://www.youtube.com/watch?v=vOuE3aDZRGo>\n"+
		"**4) The Warren: Bringing your troops to battle**\n"+
		"<https://www.reddit.com/r/ToothAndTail/comments/4th99d/tooth_and_tail_guide_chapter_4_meet_your_comrades/>\n"+
		"**4.5) Unit Overview (Courtesy of Shooflypi)**\n"+
		"<https://www.youtube.com/watch?v=PmEPEuHRoJM>\n"+
		"**5) Subtleties of Battle: Targetting and Micro\n**"+
		"<https://www.reddit.com/r/ToothAndTail/comments/4zmelb/tooth_and_tail_guide_chapter_5_the_subtleties_of/>", data);
});

let cmd_coc = new command('bookbot', '!coc', 'Get Information on **Clash of Comrades**', function(data) {
	dio.say("Sign up for Clash of Comrades' bi-monthly tournament: November Knockout **is now closed!**\n"+
		"Tournament Rules and other info: https://www.facebook.com/ClashOfComrades/ \n"+
		"Bracket Info: <http://challonge.com/cocnovemberknockout>\n\n"+

		"**Youtube page:** <https://www.youtube.com/channel/UCesgJAY8oYO9xxX_wR22WBg>\n"+
		"**Twitch Channel:** <https://www.twitch.tv/clashofcomrades>\n", data);
});

let cmd_bookbot = new command('bookbot', '!bookbot', 'Read up on Bookbot', function(data) {
	dio.say("Bookbot was a bot created by Glyde Borealis that used to be of great service for this community. His soul lives on in Pocketbot.", data);
});

module.exports.commands = [cmd_patch, cmd_newspaper, cmd_troubleshoot, cmd_guide, cmd_coc, cmd_bookbot];
