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

userdata.prototype.transferCurrency = function(fromID, toID, amount){
    //Check for parameters and users existence
    if(!fromID || !toID || !amount || !this.users[fromID]) return false;
    if(!this.users[toID]) this.users[toID] = {};
    //Check for account existence for the sender. If the receiverd doesn't have one, it's fine as it will be created
    if(!this.users[fromID].currency) return false;
    if(!this.users[toID].currency) this.setCurrency(toID, this.DEFAULT_CURRENCY_AMOUNT);
    //Check for balance
    if(this.getCurrency(fromID) < amount) return false;
    //Do the transfer
    this.setCurrency(fromID, this.getCurrency(fromID) - amount);
    this.setCurrency(toID, this.getCurrency(toID) + amount);

    return true;
}

module.exports = userdata;