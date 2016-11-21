var logger      = require('./logger'),
    personality = require('./personality'),
    helpers     = require('./helpers'),
    dio         = require('./dio');

//Command Manager, holds all the groups in one object
//groups    : object - key: group name, value: group object
function CommandManager(debugSymbol){
    this.debugSymbol = debugSymbol;
    this.activePersona = null;
    this.groups = {};
    this.spammers = {};
    this.cList = [];
}

//Add/overwrites a given group in the CommandManager
CommandManager.prototype.addGroup = function(group){
    if(!group){
        throw new Error("Group undefined cannot be added to manager");
    }

    this.groups[group.name] = group;
}

//Adds/overwrites a given command to a given group, provided the group is handled by the manager instance
CommandManager.prototype.addCommand = function(command){
    if(!command){
        throw new Error("Command undefined cannot be added via manager");
    }

    if(!this.groups[command.groupName]){
        throw new Error("Cannot add a command with a nonexistent group");
    }

    this.groups[command.groupName].add(command);
}

//Looks up a command in either all groups or a given group
CommandManager.prototype.getCommand = function(trigger, group=null){
    if(group == null){
        //If no group is given, search in all groups
        for(var key in this.groups){
            var cmd = this.groups[key].getCommand((trigger[0] == this.debugSymbol ? trigger.substring(1, trigger.length) : trigger));

            if(cmd != null){
                return cmd;
            }
        }
    }else{
        //Check if the group exists and try and call the command
        if(this.groups[group]){
            return this.groups[group].getCommand(trigger);
        }
        //If the group does not exist, throw an error
        return null;
    }

    return null;
}

//Looks up a group by name and returns it if it is found
CommandManager.prototype.getGroup = function(name){
    if(!name){
        throw new Error("Cannot search for group if no name given");
    }

    return this.groups[name];
}

CommandManager.prototype.isTrigger = function(trigger){
    if(!trigger){
        throw new Error("Bad argument");
    }

    if(trigger[0] == this.debugSymbol){
        trigger = trigger.substring(1, trigger.length);
    }

    if(this.getCommand(trigger)){
        return true;
    }else{
        return false;
    }
}

CommandManager.prototype.call = function(data, trigger, group=null){
    if(!data){
        throw new Error("No data passed to command");
    }

    if(!trigger){
        throw new Error("No trigger for call");
    }

    // ===================================
    // SPAM Control
    // ===================================
    if ( this.spammers.hasOwnProperty(data.userID) ) {
        logger.log('Spammers gonna spam.', logger.MESSAGE_TYPE.Warn)
        return false;
    } else {
        this.cList.push(data.userID);
        let c = helpers.getCount(this.cList,data.userID), // Check how many commands user has called recently
            spammers = this.spammers;

        if (c===3) {
            let v = [
                `Take it easy on the command spam <@${data.userID}> or you'll be in big trouble.`,
                `<@${data.userID}> simmer down, OR ELSE.`,
                `<@${data.userID}> take a chill pill or I'll make you.`,
                `Calm down <@${data.userID}>, too much spam and you're in for it.`
                ],
                n = Math.floor( Math.random()*4 );

            dio.say(v[n], data);
        } else if (c>2) {
            dio.say(`<@${data.userID}>, I'm going to ignore you for the next 2 minutes. Way to go.`, data);
            spammers[data.userID] = true;

            setTimeout( function() {
                delete spammers[data.userID];
            },120000);
        }

        //Check for debug symbol
        var hasDebugSymbol = (trigger[0] == this.debugSymbol);
        trigger = (trigger[0] == this.debugSymbol ? trigger.substring(1, trigger.length) : trigger);

        for(var group_name in this.groups){
            for(var command_trigger in this.groups[group_name].commands){
                if(trigger == command_trigger){
                    //Check if command has debug symbol and if bot is running in debug mode
                    if(helpers.isDebug()){
                        if(hasDebugSymbol){
                            this.groups[group_name].call(trigger, data);
                        }
                    }else{
                        if(!hasDebugSymbol){
                            this.groups[group_name].call(trigger, data);
                        }
                    }
                    //We found the trigger, no point in keeping searching
                    return;
                }
            }
        }
    }
    return false;
}

CommandManager.prototype.hasPermission = function(callerRoles, commandMinRole){
    if(commandMinRole == null){
        return true;
    }else{
        for(var key in commandMinRole){
            if(callerRoles.includes(commandMinRole[key])){
                return true;
            }
        }
        return false;
    }
}


//Gets the help text for either one or all commands
//filter        -   command trigger or group name
//lookupTarget  -   'all' for all commands, 'group' for one group, 'command' for one command
CommandManager.prototype.getHelp = function(filter, lookupTarget){
    if(!filter || !lookupTarget){
        throw new Error("Missing parameter(s)");
    }

    switch(lookupTarget){
        case('command'):{
            for(var k in this.groups){
                var cmd = this.groups[k].getCommand(filter);

                if(cmd != null){
                    return this.groups[k].getHelp(filter, 'command');
                }
            }

            return "<lookup failed>";
        }
        case('group'):{
            if(this.groups[filter]){
                return this.groups[filter].getHelp(filter, 'group');
            }

            return "<lookup failed>";
        }
        case('all'):
        default:{
            var s = "Type in **!help <groupname>** to get the commands for a certain group listed below:\n";
            for(var gk in this.groups){
                s += "**" + gk + "** - " + (this.groups[gk].description ? this.groups[gk].description : "<no description>") + "\n";
            }
            return s;
        }
    }
}

//Command Group object
//name          : string - the name of the Group
//personality   : Personality object, defining which "bot" should be used
//commands      : object - key: command trigger, value: command object
function CommandGroup(name, personality, description=""){
    if(!name){
        throw new Error("Cannot create nameless group");
    }

    if(!personality){
        throw new Error("This is not Quartermaster, give it a personality");
    }

    this.name = name;
    this.personality = personality;
    this.description = description;
    this.commands = {};
}

//Adds a command to the Group
//command   : Command   - the command object to be added
CommandGroup.prototype.add = function(command){
    if(!command){
        throw new Error("Command undefined cannot be added to group '" + this.name + "'");
    }

    this.commands[command.triggers] = command;
}

//Looks up the command map for a given trigger and returns the command object if it is found
//command_trigger   : string - Go figure
CommandGroup.prototype.getCommand = function(command_trigger){
    if(!command_trigger){
        throw new Error("Empty trigger given. Cannot get command");
    }

    if(typeof(command_trigger) != "string"){
        throw new Error("Trigger not a string!");
    }

    var cmd = null;
    for(var key in this.commands){
        //if(command_trigger == key){
        //    cmd = this.commands[key];
        //}
        for(var tkey in this.commands[key].triggers){
            if(command_trigger == this.commands[key].triggers[tkey]){
                cmd = this.commands[key];
            }
        }
    }

    return cmd;
}

//Gets the help text for either one or all commands
//filter        -   command trigger or group name
//lookupTarget  -   'group' for the whole group, 'command' for one command
CommandGroup.prototype.getHelp = function(filter, lookupTarget){
    if(!filter || !lookupTarget){
        throw new Error("Missing parameter(s)");
    }

    var s = "**" + this.name + "** - " + this.personality.emote + "\n" + (this.description ? this.description : "<no description set>") + "\n\n";

    switch(lookupTarget){
        case('command'):{
            var found = false;
            for(var k in this.commands){
                if(k == filter){
                    s = "**";
                    for(var tkey in this.commands[k].triggers){
                        s+= this.commands[k].triggers[tkey] + " ";
                    }
                    s += "**- " + this.commands[k].description + "\nBrought to you by " + this.personality.emote;
                    found = true;
                }
            }
            if(found){
                return s;
            }else{
                return "<lookup failed>";
            }
        }
        case('group'):
        default:{
            for(var k in this.commands){
                s += "\n**";
                for(var tkey in this.commands[k].triggers){
                    s+= this.commands[k].triggers[tkey] + " ";
                }
                s += "**- " + this.commands[k].description;
            }
            s += "\nBrought to you by " + this.personality.emote;
            return s;
        }
    }
}

//Looks up and calls a function by it's trigger
//trigger       : string    - chat keyword that triggers the command
//command_data  : object - object containing command/message data(user, channel, service, etc.)
CommandGroup.prototype.call = function(trigger, command_data){
    //this.personality.set(command_data.bot);
    this.getCommand(trigger).call(command_data);
}

//Command object
//groupName     : string    - name of the group the command will belong to
//triggers      : string | array    - chat keyword(s) that triggers the command
//action        : function  - function to be exectued on trigger
function Command(groupName, triggers, description="", action=null, permission=null){
    this.groupName = groupName;
    this.triggers = [];

    if(Array.isArray(triggers)){
        this.triggers = triggers;
    }else{
        this.triggers.push(triggers);
    }

    this.permissions = permission;
    this.description = description;
    this.action = action;
}

//Execute command action on trigger
//command_data  : object - object containing command/message data(user, channel, service, etc.)
Command.prototype.call = function(command_data){
    try{
        //Check if user has permission to call the command
        if(!command_data.commandManager.hasPermission(helpers.getUserRoles(command_data.bot, command_data.userID), this.permissions)){
            throw new Error("User does not have permission to call command");
        }

        var cmdResult = this.action(command_data);
        logger.log(this.groupName +': ' + (cmdResult ? cmdResult : '<no return value>'), logger.MESSAGE_TYPE.OK);
        return cmdResult;
    }catch(e){
        logger.log(this.groupName + ' - ' + this.triggers + ': Failed to execute command:\n' + e, logger.MESSAGE_TYPE.Error, e);
        return -1;
    }

}

module.exports.CommandManager   = CommandManager;
module.exports.CommandGroup     = CommandGroup;
module.exports.Command          = Command;
