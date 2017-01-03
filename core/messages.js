var helpers = require('../core/helpers');
var dio     = require('../core/dio');

var Message = function(id, content, authorID, channelID, timestamp=Date.now()){
	this.id = id;
	this.content = content;
	this.authorID = authorID;
	this.channelID = channelID;
	this.timestamp = timestamp;
}

var MessageStack = function(){
	this.Messages = [];
}


MessageStack.prototype.Delete = function(n, data){
	if(n > this.Messages.length){
		throw new Error("Cannot delete more messages than currently pushed to stack!");
	}

	for(var i = 0; i < n; i++){
		dio.del(this.Messages.pop().id, data);
	}
}

MessageStack.prototype.Push = function(message){
 	this.Messages.push(message);
}

var MessageManager = function(){
	this.Channels = {};
}

MessageManager.prototype.Push = function(message, chanID){
	if(!message){
		throw new Error("No message given");
	}

	if(!chanID){
		throw new Error("No channel ID given");
	}
	
	if(!this.Channels[chanID]){
		this.Channels[chanID] = new MessageStack();
	}

	this.Channels[chanID].Push(message);
}

MessageManager.prototype.Delete = function(n, chanID, data){
	if(!n){
		throw new Error("No number of messages given");
	}

	if(!chanID){
		throw new Error("No channel ID given");
	}
	
	if(!this.Channels[chanID]){
		throw new Error("No channel registered for ID " + chanID);
	}

	this.Channels[chanID].Delete(n, data);
}

MessageManager.prototype.AddChannels = function(client){
	for(var k in client.channels){
		this.Channels[client.channels[k].id] = new MessageStack();
	}
}

MessageManager.prototype.FilterMessages = function(filterFunction){
	var messageArray = [];

	for(var chan in this.Channels){
		var matchingMessages = this.Channels[chan].Messages.filter(filterFunction);
		if(matchingMessages != []){
			for(var k in matchingMessages){
				messageArray.push(matchingMessages[k]);
			}
		}
	}

	return messageArray;
};

MessageManager.prototype.GetUserMessages = function(userID){
	function _filterByUser(message){
		return message.authorID == userID;
	}

	return this.FilterMessages(_filterByUser);
}

MessageManager.prototype.GetMessageById = function(messageID){
	function _filterById(message){
		return message.id == messageID;
	}

	return this.FilterMessages(_filterById);
}

module.exports.MessageManager = MessageManager;
module.exports.MessageStack = MessageStack;
module.exports.Message = Message;