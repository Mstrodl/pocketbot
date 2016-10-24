/* ----------------------------------------
	These are simple helper functions to do
	some quick task/calculation
 ---------------------------------------- */
// ! -- Feel free to improve any of these functions

// Count function
function getCount(arr, val) {
	let i, j, count = 0;
	for (i=0,j=arr.length;i<j;i++) {
		(arr[i] === val) && count++;
	}
	return count;
}

// Command timer
function popCommand() {
	if (command.length>0)  command.shift();
	//console.log(command);
	setTimeout( function() {
		popCommand();
	},4000);
}

// Get player ID
function getUser(txt) {
	if (txt.match(/\b\d{10,}\b/g)) {
		return txt.match(/\b\d{10,}\b/g)[0];
	} else {
		return undefined;
	}
}
