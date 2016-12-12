var EmbedItem = function(title, text, isInline=true){
	this.name = title;
	this.value = text;
	this.isInline = isInline;
}

var Embed = function(descriptor){
	for(var key in descriptor){
		this[key] = descriptor[key];
	}
	
	this.fields = [];
}

Embed.prototype.pushItem = function(item){
	if(!item){
		throw new Error("Cannot push an empty item to an embed");
	}

	this.fields.push(item);
}


module.exports.Embed = Embed;
module.exports.EmbedItem = EmbedItem;