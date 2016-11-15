# Pocketbot

Pocketbot is the collaborated effort of the original PWG Discord bots into one.


### Quick Start

If you're just starting with Pocketbot, you most likely want to add a set of commands to it. 
The easiest way to go about this is duplicating the `cmds/basic.js` file and starting from there. Alternatively, you can start off from this base:

```javascript
// Example Command File
let logger  = require('../core/logger'),
	command = require('../core/command').Command,
	helpers = require('../core/helpers'),
	x		= require('../core/vars'),
	dio 	= require('../core/dio');

let cmd_ping = new command('basic', '!ping', 'Test command #1', function(data){
	dio.say("Pong!", data);
});

module.exports.commands = [cmd_ping];
```

A command file is split into 3 main sections.

#### The requires

Although every single one is not mandatory, you are *highly* recommended to use this initial set of requires for any set of commands you wish to add.

- **logger**  - Gives you access to the special logging features we have
- **command** - Will let you access the global command manager
- **helpers** - Gives you a handful of useful functions to perform 
- **x**       - Includes all the variables we use around the bot, such as channel, user, role, and emoji IDs
- **dio**     - Is a set of shorthand functions for common discord.io commands


#### The commands

Every command should be defined as a `new command`. The arguments will define:

- **group** - The command group defines which group the command will belong to. Generally, all commands in a file will belong to the same group.
- **trigger** - This is the actual command trigger that must be typed to set off your command
- **description** - This is the text that will show up when users use the `!help` for more information
- **callback** - The actual code for your command. Which gets passed down the `data` object (more this object later)


### The export

`module.exports.commands` is an array which should contain the names of all the commands you define in your file.

Once you've completed this, you need to add your group into app.js:

```javascript
// Contains the group name (must match the one from your commands), persona, and help descriptor for group
let basicCmdGroup 		= new command.CommandGroup('basic', mastabot, 'Basic commands');
```

You can see the available personas (or create your own) a few lines above the group assignment.

Lastly, you actually add the group into the command manager:

```javascript
globalCmdManager.addGroup(basicCmdGroup);
```

Your commands are now part of Pocketbot!



### The `data` object

Can be seen in app.js and is fairly self-explanatory, but basically contains the following:

```javascript
//Prepare command_data object
	var command_data = {
		//User data created by bots
		userdata: userdata,
		//Command manager
		commandManager: globalCmdManager,
		// Bot client object
		bot: bot,
		// Name of user who sent the message
		user: user,
		// ID of user who sent the message
		userID: userID,
		// ID of channel the message was sent in
		channelID: channelID,
		// ID of the server(guild)
		serverID: vars.chan,
		//Raw message string
		message: message,
		// ID of the message sent
		messageID: event.d.id,
		// Array of arguments/words in the message
		args: args,
		// Reference to the Firebase DB's
		db: fire
	}
```
