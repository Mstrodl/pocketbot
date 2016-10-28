var logger = require('./logger');
var personality = require('./personality');

//Command Manager, holds all the groups in one object
//groups    : object - key: group name, value: group object
function CommandManager(){
    this.groups = {};
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
            var cmd = this.groups[key].getCommand(trigger);

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
        throw new Error(group + " does not exist in this instance of the CommandManager");
    }
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

    for(var group_name in this.groups){
        for(var command_trigger in this.groups[group_name].commands){
            if(trigger == command_trigger){
                return true;
            }
        }
    }

    return false;
}

CommandManager.prototype.call = function(data, trigger, group=null){
    if(!data){
        throw new Error("No data passed to command");
    }
    
    if(!trigger){
        throw new Error("No trigger for call");
    }

    for(var group_name in this.groups){
        for(var command_trigger in this.groups[group_name].commands){
            if(trigger == command_trigger){
                this.groups[group_name].call(trigger, data);
            }
        }
    }

    return false;
}

//Command Group object
//name          : string - the name of the Group
//personality   : Personality object, defining which "bot" should be used
//commands      : object - key: command trigger, value: command object
function CommandGroup(name, personality){
    if(!name){
        throw new Error("Cannot create nameless group");
    }

    if(!personality){
        throw new Error("This is not Quartermaster, give it a personality");
    }

    this.name = name;
    this.personality = personality;
    this.commands = {};
}

//Adds a command to the Group
//command   : Command   - the command object to be added
CommandGroup.prototype.add = function(command){
    if(!command){
        throw new Error("Command undefined cannot be added to group '" + this.name + "'");
    }

    this.commands[command.trigger] = command;
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
        if(command_trigger == key){
            cmd = this.commands[key];
        }
    }

    return cmd;
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
//trigger       : string    - chat keyword that triggers the command
//action        : function  - function to be exectued on trigger
function Command(groupName, trigger, action){
    this.groupName = groupName;
    this.trigger = trigger;
    this.action = action;
}

//Execute command action on trigger
//command_data  : object - object containing command/message data(user, channel, service, etc.)
Command.prototype.call = function(command_data){
    try{
        var cmdResult = this.action(command_data);
        logger.log(this.groupName +': ' + cmdResult, logger.MESSAGE_TYPE.OK);
        return cmdResult;
    }catch(e){
        logger.log(this.groupName + ' - ' + this.trigger + ': Failed to execute command:\n' + e, logger.MESSAGE_TYPE.Error);
        return -1;
    }
    
}

module.exports.CommandManager   = CommandManager;
module.exports.CommandGroup     = CommandGroup;
module.exports.Command          = Command;