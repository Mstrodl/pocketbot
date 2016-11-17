var fs = require('fs');
var logger = require('./logger');

 

function userdata(){
    this.users = {};
    this.DEFAULT_CURRENCY_AMOUNT = 10;
};

userdata.prototype.loadFromFile = function(path){
    this.users = JSON.parse(fs.readFileSync(path));
}

userdata.prototype.saveToFile = function(path){
    fs.writeFileSync(path, JSON.stringify(this.users));
}

userdata.prototype.getCurrency = function(userID){
    if(this.users[userID]) return this.users[userID].currency;
    else return false;
}

userdata.prototype.setCurrency = function(userID, amount){
    if(!this.users[userID]) this.users[userID] = {};
    
    this.users[userID].currency = amount;
    return this.users[userID].currency;
}

userdata.prototype.transferCurrency = function(fromID, toID, amount, callback){
    //Check for parameters and users existence
    if(!fromID || !toID || !amount) return callback(`Missing parameter(s) (from: ${fromID}, to: ${toID}, amount: ${amount})`, {});
    if(!this.users[fromID]) return callback("Invalid sender. No userdata found", {});
    if(!this.users[toID]) this.users[toID] = {};
    //Check for account existence for the sender. If the receiverd doesn't have one, it's fine as it will be created
    if(!this.users[fromID].currency) return callback("User has no wallet", {});
    if(!this.users[toID].currency) this.setCurrency(toID, this.DEFAULT_CURRENCY_AMOUNT);
    //Check for balance
    if(this.getCurrency(fromID) < amount) return callback("User has insufficient funds", {});
    //Do the transfer
    this.setCurrency(fromID, this.getCurrency(fromID) - amount);
    this.setCurrency(toID, this.getCurrency(toID) + amount);

    return callback(null, {from: this.users[fromID], to: this.users[toID]});
}

userdata.prototype.getState = function(userID){
    if(!this.users[userID]){
        this.users[userID] = {};
        return null;
    } 

    return this.users[userID].state;
}

userdata.prototype.setState = function(userID, state){
    if(!this.users[userID]){
        this.users[userID] = {state: state};
    } 

    this.users[userID].state = state;
 
    return this.users[userID].state;
}

module.exports = userdata;