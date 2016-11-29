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
	}

	// Check if unit exists
	if ( u.units.hasOwnProperty(item) ) {
		let label = (u.units[item].label != undefined) ? u.units[item].label : u.units[item].name;

		// If label still sucks
		if (label === undefined) label = '???';

		// Get some of the basic unit data
		let traits = u.units[item].traits,
			cost = (u.units[item].cost != undefined) ? u.units[item].cost : 'na',
			range = '-',
			tier = (u.units[item].tier) ? `[T${Math.ceil(u.units[item].tier)}] ` : '';

		// Weapon Checker
		for (let t in traits) {
			if ( u.filters.traits[ traits[t] ].hasOwnProperty('wpn') ) {
				// Is weapon, get range
				let w = u.filters.traits[ traits[t] ].wpn.replace('weapon_','');
				range = u.weapons[w].AtkRange;
			}
		}

		// Change Avatar
		persona.setAvatar(`./assets/unit_${item}.png`, data, function() {
			setTimeout(function(){
				persona.setNick(label, data, function() {
						console.log('yay');
						dio.say(`
${u.units[item].name} | **${tier}**
:crossed_swords: **${u.units[item].atk}**    :shield: **${u.units[item].def}**    :pig2: **${cost}**    :straight_ruler: **${range}**
Traits: ${traits.join(', ')}`, data);
				});
			}, 1000);
		});

		return false;
	} else if (u.filters.traits[item]) {
		let t = u.filters.traits[item],
			w = (t.wpn) ? ':gun:' : '',
			wpn = (t.wpn) ? u.weapons[ t.wpn.replace('weapon_','') ] : '',
			extra = (w != '') ? `\n \`Cooldown: ${wpn.cool} | Range: ${wpn.AtkRange} | Aggro: ${wpn.AggRange}\`` : '';

		dio.say(`${w} **${t.label}** - ${t.desc}${extra}`, data)
	} else {
		dio.say("I don't recognize that unit/trait. Try `!units` or `!traits` to get a list.", data);
		return false;
	}
});

module.exports.commands = [cmdInfo, cmdListUnits, cmdListTraits];
