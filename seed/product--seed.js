var Product = require('../Models/Product');

var mongoose = require('mongoose');

var products = [
    new Product({
          Product_Name: 'Dừa',
          Price: 10000,
          Description: 'Dừa tươi mát lạnh',
          Img_Product: '../images/main.png',
          Url_clound: '../images/'
    }),
    new Product({
        Product_Name: 'Dưa hấu',
        Price: 15000,
        Description: 'Dưa hấu tươi xanh mát lạnh',
        Img_Product: '../images/main.png',
        Url_clound: '../images/'
    }),
    new Product({
        Product_Name: 'Chuột',
        Price: 100000,
        Description: 'Chuột không dây',
        Img_Product: '../images/main.png',
        Url_clound: '../images/'
    }),
    new Product({
        Product_Name: 'Sữa chua VPK',
        Price: 10000,
        Description: 'Sữa chua VPK ngon như nhà làm',
        Img_Product: '../images/main.png',
        Url_clound: '../images/'
    }),
    new Product({
        Product_Name: 'Quần Jean',
        Brand: 'K-',
        Price: 10000,
        Description: 'Quần Jean cao cấp',
        Img_Product: '../images/main.png',
        Url_clound: '../images/'
    }),
    new Product({
        Product_Name: 'Xe Lamborghini Huracan',
        Brand: 'Lamborghini',
        Price: 10000,
        Description: 'Siêu xe đến từ nước Ý đầy mộng mơ.',
        Img_Product: '../images/main.png',
        Url_clound: '../images/'
    }),
    new Product({
        Product_Name: 'Giày Jordan',
        Brand: 'Nike',
        Price: 10000,
        Description: 'Giày đi như lướt, như bay, cho bạn cảm giác như trên mây',
        Img_Product: '../images/main.png',
        Url_clound: '../images/'
    }),
];

var done=0;
for (var i = 0; i < products.length; i++) {
    products[i].save((err, result) => {
        done++;
        if(done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
