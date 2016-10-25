const fs = require('fs');

const book = '176530812576071680',
	mastabot = '171782210800582656',
	stealth = "98419293514919936",
	rules = '195960200237285386',
	noob = '195983997413752832',
	member = '99502270579740672',
	king = '213077157038129154',
	lfg = '238808560106995712',
	history = '196362695367196672',
	playground = '172429393501749248';

let players = [], // Whoever is ready
	users = [], // I forgot
	challengers = [], // for King battles
	rdyPpl = players.length,
	conn = 0, // Connection status
	command = [], // Array of people who last used command
	spammer = {}, // Object list of people banned for spam
	mute = false, // Mute? :P
	dance = '',
	streamer = '',
	// wolf = new wc(WOLFID),
	bookDelete = false,
	// ! - Maybe this can be automated to read from the directory instead...
	emotes = [
		':rekt:', ':yomama:', ':facefeel:',
		':nerfit:', ':trust:', ':fixit:', ':lol:',
		":wenwut:",":wenclap:", ":wenyes:", ":wenno:", ":wenmore:",":wencheer:",
		":dexclap:",":dexdance:",":dexlittle:",":dexofc:",":dexwut:",
		":schatzeh:",":schatzdance:",":schatzdrop:",":schatzmeteor:"
	],
	u = JSON.parse(fs.readFileSync('assets/units.json', 'utf8'));
