var User = require('../Models/Chat');

var mongoose = require('mongoose');

var User = [
    new User({
        Fullname: "teo",
        Product_Quantity: [
           { Product_Quantity: '5ad97e911606d417d45b6734' },
           { Product_Quantity: '5ad97e911606d417d45b6736' },
           { Product_Quantity: '5ad97aaffcbaad3b64c87166' },
           { Product_Quantity: '5ad97e911606d417d45b6737' }
        ],
        Info: 'Khoa CNTT',
        Email: 'qwe@gmail.com',
        Phone: '+8412345678',
        Avatar_Img: '../public/images/main.png'
    }),
    new User({
        Fullname: "ti",
        Product_Quantity: '5ad97e911606d417d45b6739',
        Info: 'Khoa NNA',
        Email: 'qwe@gmail.com',
        Phone: '+8412345678',
        Avatar_Img: '../public/images/main.png'
    }),
    new User({
        Fullname: "sua",
        Product_Quantity: '5ad97e911606d417d45b6738',
        Info: 'Khoa QH',
        Email: 'qwe@gmail.com',
        Phone: '+8412345678',
        Avatar_Img: '../public/images/main.png'
    }),
    new User({
        Fullname: "dan",
        Product_Quantity: '5ad97e911606d417d45b673a',
        Info: 'Khoa DA',
        Email: 'qwe@gmail.com',
        Phone: '+8412345678',
        Avatar_Img: '../public/images/main.png'
    })
];

var done=0;
for (var i = 0; i < User.length; i++) {
    User[i].save((err, result) => {
        done++;
        if(done === User.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
