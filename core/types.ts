export interface CommandData{
    //User data created by bots
	userdata,
	//Command manager
	commandManager,
	//Message manager
	messageManager,
	// Bot client object
	bot,
	// Name of user who sent the message
	user: string,
	// ID of user who sent the message
	userID: string,
	// ID of channel the message was sent in
	channelID: string,
	// ID of the server(guild)
	serverID: string,
	//Raw message string
	message: string,
	// ID of the message sent
	messageID: string,
	// Array of arguments/words in the message
	args: Array<string>,
	// Reference to the Firebase DB's
	db
}