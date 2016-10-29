let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x = require('../core/vars');

let cmdQuote = new command('quote', '!quote', `Specify a quote number to bring it up`, function(data) {
	let quotes = data.db.quotes,
		n = parseInt( data.args[1] ),
		say = function(msg) {
			data.bot.sendMessage({
				to: data.bot.channelID,
				message: msg
			});
		};

	if (Number.isNaN(n)) {
		say("🕑 I need a quote _number_, please.");
	} else {
		let qqq = quotes.orderByChild('id').equalTo(n).limitToLast(1);
		qqq.once('value', function(snap) {
			if (snap.val() === null) {
				say("🕑 Quote doesn't exist.");
				return false;
			}

			snap.forEach(function(cS) {
				let thequote = cS.val();
				if ( thequote.hasOwnProperty('quote') ) {
					if (thequote.quote.startsWith('http://') || thequote.quote.startsWith('https://')) {
						say("#"+thequote.id+" - _Quoted by: "+thequote.user+"_ \n"+thequote.quote);
					} else {
						say("#"+thequote.id+" - _Quoted by: "+thequote.user+"_ ```"+thequote.quote+"```");
					}
				} else {
					say("🕑 Quote doesn't exist.");
				}
			});
		});
	}
});

let cmdAddQuote = new command('quote', '!addquote', `Adds everything quoted into the database`, function(data) {
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

				data.bot.sendMessage({
					to: chan,
					message: "Added quote #"+qid
				});
			}
		});
	});
});

let cmdDelQuote = new command('quote', '!delquote', `Removes a quote by id`, function(data) {
	let chan = data.channelID,
		from = data.user,
		fromID = data.userID,
		uRoles = data.bot.servers[x.chan].members[fromID].roles,
		quotes = data.db.quotes,
		say = function(msg) {
			data.bot.sendMessage({
				to: chan,
				message: msg
			});
		};

	if (!uRoles.includes(x.mod) && !uRoles.includes(x.admin)) {
		say("🕑 Only Moderators and above have this power.");
		return false;
	}

	let qq = parseInt( data.args[1] );
	let y = quotes.orderByChild('id').equalTo(qq).limitToLast(1);

	if (Number.isNaN(qq)) {
		say("🕑 I need a quote _number_, please.");
	} else {
		y.once('value', function(snap) {
			snap.forEach(function(cS) {
				if ( !cS.val().hasOwnProperty('quote') ) {
					say("🕑 You cannot delete quotes that don't exist, scrub.");
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
					setTimeout( function() {
						data.bot.deleteMessage({
							channelID: chan,
							messageID: data.messageID
						});
					}, 100);

					say(`🕑 Deleted quote #${qq}`);
				} else {
					setTimeout( function() {
						data.bot.deleteMessage({
							channelID: chan,
							messageID: data.messageID
						});
					}, 100);

					say("🕑 You cannot delete quotes from the archives. You monster.");
					return false;
				}
			});
		});
	}
});

// Since both randquote and getquote have to grab the whole
// quote object, they'll use this function to deduplicate some code
function getQuote(text, quotes, bot) {
	let results = [],
		rt = 0,
		s = '',
		rand = false,
		say = function(msg) {
			bot.sendMessage({
				to: bot.channelID,
				message: msg
			});
		};

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
				say("#"+thequote.id+" - _Quoted by: "+thequote.user+"_ ```"+thequote.quote+"```");
			} else {
				say("🕑 I picked a quote that doesn't exist. Try again next time.");
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
						say(`\`\`\` ${results.join('\n\n')} \`\`\``);
					} else if (results.length > 1 && results.length < 6) {
						say(`First ${results.length} results: \n\`\`\` ${results.join('\n\n')} \`\`\``);
					} else {
						say("🕑 No quotes found with that word.");
					}
					break;
				}
			}
		}
	});
}

let cmdGetQuote = new command('quote', '!getquote', `Searches a string within the quotes and returns the first 5 results found`, function(data) {
	getQuote(data.bot.message, data.db.quotes, data.bot);
});

let cmdRandQuote = new command('quote', '!randquote', `Brings up a random quote`, function(data) {
	getQuote(data.bot.message, data.db.quotes, data.bot);
});

module.exports.commands = [cmdAddQuote, cmdDelQuote, cmdGetQuote, cmdRandQuote, cmdQuote];
