var logger = require('./logger');

//Command Manager, holds all the groups in one object
function CommandManager(){
    this.groups = {};
}

CommandManager.prototype.addGroup = function(group){
    if(!group){
        throw new Error("Group undefined cannot be added to manager");
    }

    this.groups[group.name] = group;
}

CommandManager.prototype.addCommand = function(command){
    if(!command){
        throw new Error("Command undefined cannot be added via manager");
    }

    if(!this.groups[command.groupName]){
        throw new Error("Cannot add a command with a nonexistent group");
    }

    this.groups[command.groupName].add(command);
}

//Command Group object
//name      : string - the name of the Group
//commands  : object - key: command trigger, value: command object
function CommandGroup(name){
    this.name = name;
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

    if(cmd == null){
        throw new Error("No command for trigger '" + command_trigger + "' found");
    }

    return cmd;
}

//Looks up and calls a function by it's trigger
//trigger       : string    - chat keyword that triggers the command
//command_data  : object - object containing command/message data(user, channel, service, etc.)
CommandGroup.prototype.call = function(trigger, command_data){
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
        let cmdResult = this.action(command_data);
        logger.log(this.groupName + '- ' + this.trigger + ': ' + cmdResult);
        return cmdResult;
    }catch(e){
        logger.log(this.groupName + '- ' + this.trigger + ': Failed to execute command:\n' + e);
        return -1;
    }
    
}

module.exports.CommandManager   = CommandManager;
module.exports.CommandGroup     = CommandGroup;
module.exports.Command          = Command;