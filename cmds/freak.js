const dio   = require('../core/dio'),
	command = require('../core/command').Command,
    logger  = require('../core/logger'),
	stripIndents  = require('common-tags').stripIndents;

const CAH = {
    minPlayers: 1
}

const players = [];

const cmdFing = new command('freak', '!fing', 'Fing Fong Fung!!!', function(data){
	dio.say("Hail Freakspot, the one true Master.", data);
});

const cmdCah = new command('freak', '!cah', 'Caw cawwwww', function(data){
    players.push({
        id: data.userID,
        name: data.user
    });
    console.log(players);

    let message;
    if (players.length === CAH.minPlayers) {
        message = stripIndents`
            Great that you wanna play, <@${data.userID}>!
            The minimum amount of players has been reached.
            
            As soon as everyone's ready, start the game with **!fml**.`
            // Show players here
    } else {
        message = stripIndents`
            Great that you wanna play, <@${data.userID}>!
            Let's wait for atleast ${CAH.minPlayers - players.length} more players, shall we?

            [Minimum players required: ${CAH.minPlayers}]`
    }

	dio.say(message, data);
});

const cmdFml = new command('freak', '!fml', 'Fock ma luf', function(data){
	if (!players.length === CAH.minPlayers) {
        dio.say(stripIndents`
            Calm your tits, ${data.userID}.
            We'll need atleast ${CAH.minPlayers - players.length} more players.`, data);
    } else {
        players.forEach(function() {
            dio.say();
        });
    }
});

const cmdFnl = new command('freak', '!fnl', 'Fock ma luf', function(data){
	console.log("hi")
});

module.exports.commands = [cmdFing, cmdCah, cmdFml, cmdFnl];