let fs = require('fs');

module.exports = {
	chan: "99240110486192128", // PWG Server/Main Channel ID
	// Users -----------------------
	pocketbot: '171782210800582656',
	stealth: "98419293514919936",
	schatz: "99245922310959104",
	nguyen: "99233194800328704",
	dex: "146375850705551360",
	// Roles -----------------------
	noob: '195983997413752832',
	member: '99502270579740672',
	king: '213077157038129154', // Crown
	lfg: '238808560106995712', // Looking for game
	mod: '99565011696910336',
	admin: '103552189221326848', //Developer
	ranger: '245142907097579520',
	// Channels --------------------
	memchan: '245596925531783168',
	rules: '195960200237285386',
	history: '196362695367196672',
	playground: '172429393501749248',
	modchan: '180446374704316417',
	wikichan: '235495724542853120',
	techtalk: '200666247694778378',
	// ! - Maybe this can be automated to read from the directory instead...
	emotes: [
		':rekt:', ':yomama:', ':facefeel:',
		':nerfit:', ':trust:', ':fixit:', ':lol:',
		":wenwut:",":wenclap:", ":wenyes:", ":wenno:", ":wenmore:",":wencheer:",
		":dexclap:",":dexdance:",":dexlittle:",":dexofc:",":dexwut:",
		":schatzeh:",":schatzdance:",":schatzdrop:",":schatzmeteor:"
	]
	// ! -- Move these 3 into the command stuff
	// spammer: {}, // Object list of people banned for spam
	// mute: false, // Mute? :P
	// streamer: ''
}
