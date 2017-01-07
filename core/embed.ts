interface IEmbed{
	title: string;
	description: string;
	color: string;
}

interface IEmbedMedia{
	url: string;
	width: number;
	height: number;
}

export class EmbedItem{
	public name: string;
	public value: string;
	public inline: boolean;

	public constructor(title, text, isInline=false){
		this.name = title;
		this.value = text;
		this.inline = isInline;
	}
}

export class Embed implements IEmbed{
	public title: string;
	public description: string;
	public color: string;

	public type?: string;
	public fields?: EmbedItem[];
	public image?: IEmbedMedia;
	public thumbnail?: IEmbedMedia;
	public video?: IEmbedMedia;

	public constructor(descriptor: IEmbed){
		for(var key in descriptor){
			this[key] = descriptor[key];
		}

		this.fields = [];
		this.type = 'rich';
	}

	pushItem(item: EmbedItem){
		if(!item){
			throw new Error("Cannot push an empty item to an embed");
		}

		this.fields.push(item);
	}

	setImage(url: string, width: number = 128, height:number = 128){
		this.image = {
			url: url,
			width: width,
			height: height
		}
	}

	setThumbnail(url: string, width: number = 128, height:number = 128){
		this.thumbnail = {
			url: url,
			width: width,
			height: height
		}
	}

	setVideo(url: string, width: number = 128, height:number = 128){
		this.image = {
			url: url,
			width: width,
			height: height
		}
	}
}
