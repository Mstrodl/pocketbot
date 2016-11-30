# Pocketbot

Pocketbot is the collaborated effort of the original PWG Discord bots into one. Join the Pocketbot creators in [#techtalk](https://discord.gg/tHybJ6h) if you have any questions!


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

## Firebase Quick Start

Pocketbot primary uses [Firebase](https://www.firebase.com/) as a backend for data. In the above `data` object,
you can access the public database which currently contains quotes and player data under `data.db.quotes` and `data.db.soldiers`, respectively.

For complete Firebase documentation, check [here](https://firebase.google.com/docs/database/web/read-and-write).

### Writing Data

You can write data in 2 main ways: a `set` will push (and overwrite any existing) data into a new object, while an `update` can be used to change
a specific property (or multiple) of an existing object.

#### Set
For example, to push a new quote, we do the following:
```javascript
// This is the structure of the quote, and the data we are pushing into it
let newquote = {
	id: qid,
	user: from,
	quote: data.message.replace('!addquote ',''),
	time: Math.round(+new Date()/1000)
}

// We allow the quotes to generate its own ID in the Firebase,
// so we go ahead and push new data in, and get the reference for
// the new, empty object in the database
let newquoteRef = quotes.push();
// Then we set the data on that object/reference w/ our stuff
newquoteRef.set(newquote);
```

#### Update

In the case of an update, here's an example of how we add votes to a player in the database:
```javascript
// .child let's us grab a child object/reference. In this case we access our player database
// under data.db.soldiers, and we look for the child reference by the user ID (in this case,
// we've set 'lucky' to be the userID of the player being voted to receive a key)
let newplayer = data.db.soldiers.child(lucky);

// Now we access (or create if it doesn't exist) the `vote` property of the previous user reference
// and update it with our voter object
newplayer.child('vote').update(voter);
```

There are of course a ton of checks and stuff you'd want to do before you update info (the above example first reads all of
data.db.soldiers to make sure the user exists, already has votes, hasn't been voted already by same user, etc.) but this is
how you would update a user.

**============================================================================**

**WARNING** Unless you're writing brand new data,
always try to use update to be safe.

If we replaced the above with `newplayer.child('vote').set(voter);` you would

end up nuking **all** previous data except the new stuff you just pushed in.

**============================================================================**

### Reading Data

The most used reading call in Pocketbot is currently the `.once()` call, which is basically the equivalent of `.ajax()` for Firebase:

```javascript
data.db.soldiers.once("value", function(snap) {
    // The snap(shot) that is returned by once is a JSON object of the database.
    // You can read through it just like any other JSON
    let playerList = snap.val(),
        masta = playerList[x.masta],
        mastaStatus = masta.status;
}, function(err) {
    // Make sure to error log the crap out of Firebase, since it fails silently
    // by default and then you'll bang your face against a wall for hours why something doesn't work!
	logger.log(err, logger.MESSAGE_TYPE.Error);
});
```
