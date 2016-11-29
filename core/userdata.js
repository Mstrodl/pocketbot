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

userdata.prototype.getProp = function(userID, prop){
    // Checks userID in database, should return
    // null if user didn't exist or on Firebase error
    return new Promise( (resolve, reject) => {
        this.db.child(userID).once("value", function(user){
            if ( user.val().hasOwnProperty(prop) ) {
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

userdata.prototype.setProp = function({ user = null, prop = null, }){
        if (typeof user === 'object') {
            // Copies full Discord user object into FB.
            this.db.child(user.id).update(user);
            // For user presence updates
            if (prop.name === 'state') return user.status;
        } else if (user != null) {
            // .update() will autocreate user if they don't
            // exist, and will only update new information
            let newprop = {};
            newprop[prop.name] = prop.data;
            this.db.child(user).update(newprop);
            // For user banking updates
            if (prop.name === 'currency') return prop.data;

            return user;
        }
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
                if ( !u.hasOwnProperty(fromID) || !u[fromID].hasOwnProperty('currency') ) resolve( {err: "You don't have a wallet. Use `!wip` to make an account." } );
                // If the receiver doesn't have one, it's fine as it will be created
                if ( !u.hasOwnProperty(toID) || !u[toID].hasOwnProperty('currency') ) ud.setProp({
                    user: toID,
                    prop: {
                        name: 'currency',
                        data: ud.DEFAULT_CURRENCY_AMOUNT
                    }
                });

                // Check for balance
                ud.getProp(fromID, 'currency').then( (res) => {
                    if (res < amount){
                        resolve( {err: "User has insufficient funds" } );
                    } else {
                        // Do the transfer
                        ud.setProp({
                            user: fromID,
                            prop: {
                                name: 'currency',
                                data: res - amount
                            }
                        });

                        ud.getProp(toID, 'currency').then( (toBank) => {
                            ud.setProp({
                                user: toID,
                                prop: {
                                    name: 'currency',
                                    data: toBank + amount
                                }
                            });
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

module.exports = userdata;
