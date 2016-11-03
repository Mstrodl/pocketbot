var fs = require('fs');
var logger = require('./logger');

function userdata(){
    this.users = {};
};

userdata.prototype.loadFromFile = function(path){
    this.users = JSON.parse(fs.readFileSync(path));
}

userdata.prototype.saveToFile = function(path){
    fs.writeFileSync(path, JSON.stringify(this.users));
}

module.exports = userdata;