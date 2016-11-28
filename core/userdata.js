var fs = require('fs');
var logger = require('./logger');


function userdata(fb){
    this.users = {};
    this.db = (fb) ? fb : null;
    this.DEFAULT_CURRENCY_AMOUNT = 10;
};

userdata.prototype.load = function(){
    if (this.db === null) {
        logger.log('User Database Loaded Unsuccessfully', 'Error');
        return false;
    }

    this.db.once("value", function(ud){
        //this.users = ud.val();
        logger.log('Loaded User Database', 'OK');
    }, function(err){
        logger.log(err, 'Error');
    });
}

userdata.prototype.save = function(db){
    console.log(this.users);
    //db.child('playerstest').update(this.users);
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
    // Checks userID in database, should return
    // null if user didn't exist or on Firebase error
    this.db.child(userID).once("value", function(user){
        if (user.val().status) {
            return user.val().status;
        } else {
            return null;
        }
    }, function(err){
        logger.log(err, logger.MESSAGE_TYPE.Error);
        return null;
    });
}

userdata.prototype.setState = function(user){
    // Copies Discord user object into FB.
    // .update() will autoadd if user doesn't exist,
    // and will only update new information
    this.db.child(user.id).update(user);

    return user.status;
}

module.exports = userdata;
