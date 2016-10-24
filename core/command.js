//TODO: Log error when logging is


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

    if(typeof(command) != "Command"){
        throw new Error("Noncommand cannot be added to group '" + this.name + "'");
    }

    this.commands[command.trigger] = command;
}

//Looks up the command map for a given trigger and returns the command object if it is found
//command_trigger   : string - Go figure
CommandGroup.prototype.getCommand = function(command_trigger){
    if(!command_trigger){
        throw new Error("Empty trigger given. Cannot get command");
    }

    if(typeof(command) != "string"){
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

//Command object
//trigger   : string    - chat keyword that triggers the command
//action    : function  - function to be exectued on trigger
function Command(trigger, action){
    this.trigger = trigger;
    this.action = action;
}

//Execute command action on trigger
//command_data  : object - object containing command/message data(user, channel, service, etc.)
Command.prototype.call = function(command_data){
    //TODO: Log command once logging is a thing
    this.action(command_data);
}