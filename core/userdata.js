let fs = require('fs'),
    logger = require('./logger');

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

// ! -- What was this for?
// userdata.prototype.save = function(db){
//     console.log(this.users);
// }

userdata.prototype.getProperty = function(userID,prop){
    // Checks userID in database, should return
    // null if user didn't exist or on Firebase error
    return new Promise( (resolve, reject) => {
        this.db.child(userID).once("value", function(user){
            if ( user.val().hasOwnProperty(prop) ) {
                //console.log('Got :'+user.val().currency);
                resolve( user.val()[prop] );
            } else {
                resolve( false );
            }
        }, function(err){
            logger.log(err, logger.MESSAGE_TYPE.Error);
            reject(false);
        });
    });
}

userdata.prototype.setCurrency = function(userID, amount){
    this.db.child(userID).update({ currency: amount });
    return amount;
}

userdata.prototype.transferCurrency = function(fromID, toID, amount){
    let ud = this;
    // Check for parameters...
    if(!fromID || !toID || !amount) return {err: `Missing parameter(s) (from: ${fromID}, to: ${toID}, amount: ${amount})`};

    return new Promise( (resolve, reject) => {
        // ...and user's existence
        this.db.once("value", function(users){
            if ( users.val().hasOwnProperty(fromID) ) {
                let u = users.val();

                // Check for account existence for the sender.
                if ( !u[fromID].hasOwnProperty('currency') ) resolve( {err: "You don't have a wallet. Use `!wip` to make an account." } );
                // If the receiver doesn't have one, it's fine as it will be created
                if ( !u[toID].hasOwnProperty('currency') ) ud.setCurrency(toID, ud.DEFAULT_CURRENCY_AMOUNT);

                // Check for balance
                ud.getCurrency(fromID).then( (res) => {
                    if (res < amount){
                        resolve( {err: "User has insufficient funds" } );
                    } else {
                        // Do the transfer
                        ud.setCurrency(fromID, res - amount);

                        ud.getCurrency(toID).then( (toBank) => {
                            ud.setCurrency(toID, toBank + amount);
                        });

                        // ! -- What is this for?
                        resolve( { from: u[fromID], to: u[toID] } );
                    }
                });
            } else {
                resolve( {err: "Invalid sender. No userdata found" } );
            }
        }, function(err){
            logger.log(err, logger.MESSAGE_TYPE.Error);
            resolve( { err: "User has no wallet"} );
        });
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
