require('dotenv').config()

module.exports = {
	TOKEN: process.env.TOKEN,
	TWITCHID: process.env.TWITCHID,
	FBKEY: function() {
		if (process.env.hasOwnProperty('FBKEY')) {
			return process.env.FBKEY;
		} else { return false; }
	},
	FBPKEY: function() {
		if (process.env.hasOwnProperty('FBPKEY')) {
			return process.env.FBPKEY.replace(/\\n/g, '\n');
		} else { return false; }
	},
	FBPKEYID: function() {
		if (process.env.hasOwnProperty('FBPKEYID')) {
			return process.env.FBPKEYID;
		} else { return false; }
	},
	FBKEY2: function() {
		if (process.env.hasOwnProperty('FBKEY2')) {
			return process.env.FBKEY2;
		} else { return false; }
	}
}
