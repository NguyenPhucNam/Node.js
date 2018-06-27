var Admin = require('../Models/Admin');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chotot');

var Admin = [
    new Admin({
        Name: "Admin",
        Info: 'Khoa CNTT',
        Email: 'qwe@gmail.com',
        Phone: '+8412345678',
        Avatar_Img: '../public/images/main.png'
    })
];

var done=0;
for (var i = 0; i < Admin.length; i++) {
    Admin[i].save((err, result) => {
        done++;
        if(done === Admin.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
