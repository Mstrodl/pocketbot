var helpers = require('../core/helpers');
var dio     = require('../core/dio');

var MessageStack = function(){
	this.MessageIDs = [];
}


MessageStack.prototype.Delete = function(n, data){
	if(n > this.MessageIDs.length){
		throw new Error("Cannot delete more messages than currently pushed to stack!");
	}

	for(var i = 0; i < n; i++){
		dio.del(this.MessageIDs.pop(), data);
	}
}

MessageStack.prototype.Push = function(msgID){
	this.MessageIDs.push(msgID);
}

var MessageManager = function(){
	this.Channels = {};
}

MessageManager.prototype.Push = function(msgID, chanID){
	if(!msgID){
		throw new Error("No message ID given");
	}

	if(!chanID){
		throw new Error("No channel ID given");
	}
	
	if(!this.Channels[chanID]){
		this.Channels[chanID] = new MessageStack();
	}

	this.Channels[chanID].Push(msgID);
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

module.exports.MessageManager = MessageManager;
module.exports.MessageStack = MessageStack;