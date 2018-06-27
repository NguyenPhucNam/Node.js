var Product_Type = require('../Models/Product_Type');

var mongoose = require('mongoose');

mongoose.connect('mongodb://superMarketVLU:asdasd@ds157833.mlab.com:57833/testchotot');

var product_type = [
    new Product_Type({
        Title: 'Dụng cụ học tập',
        Icon: 'fa fa-lemon-o',
    }),
    new Product_Type({
        Title: 'Phụ kiện thời trang',
        Icon: 'fa fa-cutlery',
    })
];

var done=0;
for (var i = 0; i < product_type.length; i++) {
    product_type[i].save((err, result) => {
        done++;
        if(done === product_type.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
