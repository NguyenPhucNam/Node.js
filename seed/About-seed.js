var About = require('../Models/About');

var mongoose = require('mongoose');

mongoose.connect('mongodb://superMarketVLU:asdasd@ds157833.mlab.com:57833/testchotot');

var About = [ new About({
    Title: 'Gắn kết mọi người mua bán lại gần nhau hơn, hỗ trợ ân cần trên từng sản phẩm.',
    Description: 'Bán những gì bạn có, mua những gì bạn cần, Trang mua,bán các sản phẩm dành cho trường Đại học Văn Lang',
    Img_Company: '../public/images/chotot.png',
    Img_Member: 'mihawk.jpg,mihawk.jpg,mihawk.jpg,mihawk.jpg,mihawk.jpg,mihawk.jpg,mihawk.jpg'
})
];

var done=0;
for (var i in About) {
    About[i].save((err, result) => {
        done++;
        if(done === About.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
