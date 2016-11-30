/* ----------------------------------------
	This file contains the updated version
	of the !info command from Mastabot.
 ---------------------------------------- */

let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	x 		= require('../core/vars'),
	dio 	= require('../core/dio'),
	udata 	= require('../core/unitdata');

function listStuff(l,data,u=false) {
	console.log('LISTING')
	let list = [];
	Object.keys(l).forEach( (el) => {
		list.push(el);
	});

	if (u) {
		dio.say(`🕑 Available units: \n \`\`\`${list.join(' | ')} \`\`\` ` , data);
	} else {
		dio.say(`🕑 Available traits: \n \`\`\`${list.join(' | ')} \`\`\` ` , data);
	}
}

let cmdListUnits = new command('unitinfo', '!units', `Shows you information on a given unit`, function(data) {
	listStuff(udata.u.units, data, true);
});

let cmdListTraits = new command('unitinfo', '!traits', `Shows you information on a given unit`, function(data) {
	listStuff(udata.u.filters.traits, data);
});

let cmdInfo = new command('unitinfo', '!info', `Shows you information on a given unit`, function(data) {
	let chan = data.channelID,
		fromID = data.userID,
		item = (data.args[1]) ? data.args[1].toLowerCase() : '',
		u = udata.u,
		persona = data.commandManager.groups.unitinfo.personality;

	// Aliases for unit names
	switch (item) {
		case 'squirrels':
			item = 'squirrel'
			break;
		case 'lizards':
			item = 'lizard'
			break;
		case 'toads':
			item = 'toad'
			break;
		case 'moles':
			item = 'mole'
			break;
		case 'pigeons':
			item = 'pigeon'
			break;
		case 'ferrets':
			item = 'ferret'
			break;
		case 'skunks':
			item = 'skunk'
			break;
		case 'falcons':
			item = 'falcon'
			break;
		case 'snakes':
			item = 'snake'
			break;
		case 'wire':
		case 'bw':
		case 'barbed wire':
		case 'barbwire':
			item = 'barbedwire'
			break;
		case 'mine':
		case 'mines':
			item = 'landmine'
			break;
		case 'cham':
		case 'chams':
		case 'chameleons':
			item = 'chameleon'
			break;
		case 'sniper balloon':
		case 'sniperballoon':
		case 'sniper':
		case 'baloon':
			item = 'balloon'
			break;
		case 'turret':
		case 'turrets':
		case 'nest':
		case 'machine gun':
		case 'mg':
		case 'mgn':
			item = 'machinegun'
			break;
		case 'arty':
			item = 'artillery'
			break;
		case 'mice':
			item = 'mouse'
			break;
	}

	// Check if unit exists
	if ( u.units.hasOwnProperty(item) ) {
		let label = (u.units[item].label != undefined) ? u.units[item].label : u.units[item].name;

		// If label still sucks
		if (label === undefined) label = '???';

		// Get some of the basic unit data
		let traits = (u.units[item].traits) ? u.units[item].traits : [],
			cost = (u.units[item].cost != undefined) ? u.units[item].cost : 'n/a',
			range = 'n/a',
			tier = (u.units[item].tier) ? `[T${Math.ceil(u.units[item].tier)}] ` : 'n/a';

		// Weapon Checker
		if (traits.length > 0) {
			for (let t in traits) {
				if ( u.filters.traits[ traits[t] ].hasOwnProperty('wpn') ) {
					// Is weapon, get range
					let w = u.filters.traits[ traits[t] ].wpn.replace('weapon_','');
					range = u.weapons[w].AtkRange;
				}
			}
		}

		// More Info
		let warren = (!u.units[item].struct) ? x.emojis[`warrent${u.units[item].tier}`] : '',
			ucost = (!u.units[item].struct && u.units[item].tier) ? `(${20*Math.pow(3, u.units[item].tier-1)}/unit)` : '',
			url = '';

		// Wiki Link
		if (u.units[item].struct) {
			if (item != 'pig' && item != 'gristmill') {
				url = `\n\nMore info: <https://toothandtailwiki.com/structures/${item}>`;
			} else {
				url = `\n\nMore info: <https://toothandtailwiki.com/structures/gristmills-farms-pigs/>`;
			}
		} else if (!u.units[item].struct && tier != 'n/a') {
			let t = u.units[item].tier;
			url = (t && t != 3) ? `\n\nMore info: <https://toothandtailwiki.com/units/${item}s>` : `\n\nMore info: <https://toothandtailwiki.com/units/${item}>`;
		} else {
			url = `\n\nMore info: <https://toothandtailwiki.com/>`;
		}

		// Change Avatar
		persona.setAvatar(`./assets/unit_${item}.png`, data, function() {
			setTimeout(function(){
				persona.setNick(label, data, function() {
						console.log('yay');
						dio.say(`
${u.units[item].name} | **${(tier != 'n/a') ? tier : ''}** ${(warren != undefined) ? warren: ''}
:crossed_swords: **${(u.units[item].atk) ? u.units[item].atk : 'n/a'}**    :shield: **${u.units[item].def}**    :pig2: **${cost}** ${ucost}    :gun: **${range}**
Traits: \`${traits.join('`, `')}\` ${url}`, data);
				});
			}, 1000);
		});

		return false;
	} else if (u.filters.traits[item]) {
		let t = u.filters.traits[item],
			w = (t.wpn) ? ':gun:' : '',
			wpn = (t.wpn) ? u.weapons[ t.wpn.replace('weapon_','') ] : '',
			extra = (w != '') ? `\n\n \`Cooldown: ${wpn.cool} | Range: ${wpn.AtkRange} | Aggro: ${wpn.AggRange}\`` : '';

		dio.say(`${w} **${t.label}** - ${t.desc}${extra}`, data)
	} else {
		dio.say("I don't recognize that unit/trait. Try `!units` or `!traits` to get a list.", data);
		return false;
	}
});

module.exports.commands = [cmdInfo, cmdListUnits, cmdListTraits];
