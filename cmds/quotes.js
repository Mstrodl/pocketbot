/* ----------------------------------------
	This file controls all quote
	based commands from Mastabot
 ---------------------------------------- */

 let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x 		= require('../core/vars'),
	dio		= require('../core/dio');

let cmdQuote = new command('quote', '!quote', `Specify a quote number to bring it up`, function(data) {
	// Make sure we're getting Firebase
	if (!data.db.quotes) {
		logger.log('Firebase tokens are busted.', logger.MESSAGE_TYPE.Warn);
		return false;
	}

	let quotes = data.db.quotes,
		n = parseInt( data.args[1] );

	if (Number.isNaN(n)) {
		dio.say("🕑 I need a quote _number_, please.", data);
	} else {
		let qqq = quotes.orderByChild('id').equalTo(n).limitToLast(1);
		qqq.once('value', function(snap) {
			if (snap.val() === null) {
				dio.say("🕑 Quote doesn't exist.", data);
				return false;
			}

			snap.forEach(function(cS) {
				let thequote = cS.val();
				if ( thequote.hasOwnProperty('quote') ) {
					if (thequote.quote.startsWith('http://') || thequote.quote.startsWith('https://')) {
						dio.say("#"+thequote.id+" - _Quoted by: "+thequote.user+"_ \n"+thequote.quote, data);
					} else {
						dio.say("#"+thequote.id+" - _Quoted by: "+thequote.user+"_ ```"+thequote.quote+"```", data);
					}
				} else {
					dio.say("🕑 Quote doesn't exist.", data);
				}
			});
		});
	}
});

let cmdAddQuote = new command('quote', '!addquote', `Adds everything quoted into the database`, function(data) {
	// Make sure we're getting Firebase
	if (!data.db.quotes) {
		logger.log('Firebase tokens are busted.', logger.MESSAGE_TYPE.Warn);
		return false;
	}

	let quotes = data.db.quotes,
	// Find the last quote by ID
		qid = null,
		from = data.user,
		q = quotes.orderByChild('id').limitToLast(1);

	q.once('value', function(snap) {
		snap.forEach(function(cS) {
			// Got a real quote?
			if (cS.val().id != null) {
				qid = cS.val().id + 1;

				let newquote = {
					id: qid,
					user: from,
					quote: data.message.replace('!addquote ',''),
					time: Math.round(+new Date()/1000)
				}

				let newquoteRef = quotes.push();
				newquoteRef.set(newquote);

				dio.say(`Added quote #${qid}`, data);
			}
		});
	});
});

let cmdDelQuote = new command('quote', '!delquote', `Removes a quote by id`, function(data) {
	// Make sure we're getting Firebase
	if (!data.db.quotes) {
		logger.log('Firebase tokens are busted.', logger.MESSAGE_TYPE.Warn);
		return false;
	}

	let chan = data.channelID,
		from = data.user,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		quotes = data.db.quotes;

	if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) {
		dio.say("🕑 Only Moderators and above have this power.", data);
		return false;
	}

	let qq = parseInt( data.args[1] );
	let y = quotes.orderByChild('id').equalTo(qq).limitToLast(1);

	if (Number.isNaN(qq)) {
		dio.say("🕑 I need a quote _number_, please.", data);
	} else {
		y.once('value', function(snap) {
			snap.forEach(function(cS) {
				if ( !cS.val().hasOwnProperty('quote') ) {
					dio.say("🕑 You cannot delete quotes that don't exist, scrub.", data);
					return false;
				}
				// Valid quote number and not from archives
				if (qq > 260) {
					let delquote = {
						id: qq,
						user: null,
						quote: null,
						time: null
					}

					quotes.child(cS.key).set(delquote);
					dio.del( data.messageID, data)
					dio.say(`🕑 Deleted quote #${qq}`, data);
				} else {
					dio.del( data.messageID, data);
					dio.say("🕑 You cannot delete quotes from the archives. You monster.", data);
					return false;
				}
			});
		});
	}
});

// Since both randquote and getquote have to grab the whole
// quote object, they'll use this function to deduplicate some code
function getQuote(quotes, text, bot) {
	let results = [],
		rt = 0,
		s = '',
		rand = false;

	if (text.startsWith('!randquote')) {
		rand = true;
	} else {
		s = text.replace('!getquote ','');
	}

	quotes.once('value', function(snap) {
		let n = snap.numChildren(),
			snapVal = snap.val();

		if (rand) {
			let x = Math.floor(Math.random() * (n - 1)) + 1;
			let thequote = snapVal[ Object.keys(snapVal)[x] ];

			if ( thequote.hasOwnProperty('quote') ) {
				dio.say("#"+thequote.id+" - _Quoted by: "+thequote.user+"_ ```"+thequote.quote+"```", bot);
			} else {
				dio.say("🕑 I picked a quote that doesn't exist. Try again next time.", bot);
			}
		} else {
			for (let i=0; i<n; i++) {
				let quotes = snapVal[ Object.keys(snapVal)[i] ];
				if (quotes.hasOwnProperty('quote')) {
					let q = quotes.quote.toLowerCase();
					if ( q.includes(s) ) {
						results.push(`#${quotes.id} - ${quotes.quote}`);
						rt++;
					}
				}

				if (i+1 >= n || results.length === 5) {
					//console.log('Finished search.');
					if (results.length === 1) {
						dio.say(`\`\`\` ${results.join('\n\n')} \`\`\``, bot);
					} else if (results.length > 1 && results.length < 6) {
						dio.say(`First ${results.length} results: \n\`\`\` ${results.join('\n\n')} \`\`\``, bot);
					} else {
						dio.say("🕑 No quotes found with that word.", bot);
					}
					break;
				}
			}
		}
	});
}

let cmdGetQuote = new command('quote', '!getquote', `Searches a string within the quotes and returns the first 5 results found`, function(data) {
	// Make sure we're getting Firebase
	if (!data.db.quotes) {
		logger.log('Firebase tokens are busted.', logger.MESSAGE_TYPE.Warn);
		return false;
	} else {
        console.log(data.bot.message);
        getQuote(data.db.quotes, data.message, data); }
});

let cmdRandQuote = new command('quote', '!randquote', `Brings up a random quote`, function(data) {
	// Make sure we're getting Firebase
	if (!data.db.quotes) {
		logger.log('Firebase tokens are busted.', logger.MESSAGE_TYPE.Warn);
		return false;
	} else {
        getQuote(data.db.quotes, data.message, data); }
});

module.exports.commands = [cmdAddQuote, cmdDelQuote, cmdGetQuote, cmdRandQuote, cmdQuote];
