var Account = require('../Models/Account');
var Admin = require('../Models/Admin'),
    Product = require('../Models/Product'),
    User = require('../Models/User');
var mongoose = require('mongoose');

mongoose.connect('mongodb://superMarketVLU:asdasd@ds157833.mlab.com:57833/testchotot');

var Account = [
    new Account({
        email: 'h@gmail.com',
        password: 'asdzxc'
    })
];

var done=0;
for (var i = 0; i < Account.length; i++) {
    Account[i].save((err, result) => {
        done++;
        if(done === Account.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
