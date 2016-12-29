var EmbedItem = function(title, text, isInline=false){
	this.name = title;
	this.value = text;
	this.inline = isInline;
}

var Embed = function(descriptor){
	for(var key in descriptor){
		this[key] = descriptor[key];
	}
	
	this.fields = [];
	this.type = 'rich';
}

Embed.prototype.pushItem = function(item){
	if(!item){
		throw new Error("Cannot push an empty item to an embed");
	}

	this.fields.push(item);
}

Embed.prototype.setImage = function(url, width=128, height=128){
	this.image = {
		url: url,
		width: width,
		height: height
	}
}

Embed.prototype.setThumbnail = function(url, width=128, height=128){
	this.thumbnail = {
		url: url,
		width: width,
		height: height
	}
}

Embed.prototype.setVideo = function(url, width=128, height=128){
	this.image = {
		url: url,
		width: width,
		height: height
	}
}


module.exports.Embed = Embed;
module.exports.EmbedItem = EmbedItem;