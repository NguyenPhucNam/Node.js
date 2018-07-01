"use strict";
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const Account = require('../Models/Account');
const Product = require('../Models/Product');
const Product_Type = require('../Models/Product_Type');
const mongoose = require('mongoose');
const config = require('../config/default');
const nodemailer = require('nodemailer');

//Set luu
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
        let imgArr = Date.now();
		cb(null, imgArr);
		}
});

//Init Upload
const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 6
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
  storage: storage
}).array('productImg', 6);

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Vui lòng chỉ chọn đúng định dạng ảnh&nbsp;<i class="text-primary">( .JPG |.JPEG |.PNG |.GIF )</i>.');
  }
}

exports.get_detail_products_from_Id = (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
    if(err) { return res.status(404).json('Not Found'); }
      Account.findById(product.Seller ,(err, nguoidung) => {
        if(err) { return res.status(404).json('Not Found'); }
        else {
          Product.find({$and: [{ Seller: nguoidung._id}, { Enable: true }]}, function(err, PoS) {
            if(err) { return res.status(404).json('Lỗi Seller_id'); }
            Product_Type.findById(product.Product_Type ,(err,types) => {
              if(err) { return res.status(404).json('Lỗi Product_Type ID'); }
              Product_Type.findOne((err,Onetypes) => {
              if(err) { return res.status(404).json(err); }
              let all_Img = product.Img_Product.split(",");
              PoS.map(function(imgEdit) {
                let	propImg = 'Img_Product',
                    position = imgEdit.Img_Product.indexOf(',');
                if(imgEdit.Img_Product.length !== position) {
                  imgEdit[propImg] = imgEdit.Img_Product.split(",", 1);
                }
                else {
                  imgEdit[propImg] = imgEdit.Img_Product;
                }
                return imgEdit;
              });
              res.render('Page/chi-tiet-san-pham', {
                title: 'Chi tiết sản phẩm',
                product: product,
                Url_clound: product.Url_clound,
                seller: nguoidung,
                pos: PoS,
                all_Img: all_Img,
                one_typeid: types,
                path: config.Path,
                all_typeid: Onetypes._id
              });
            });
          });
          });
        }
      });
  });
};


exports.get_add_products = (req, res, next) => {
  Product.find((err, docs) => {
    if (err) return res.send(err);
    Product_Type.find((err, types) => {
      if (err) return res.send(err);
      res.render('Page/Product/Add', {
        title: 'Thêm sản phẩm',
        chuto: 'Kênh người bán',
        csrfToken: req.csrfToken(),
        products: docs ,
        path: config.Path,
        type: types,
        mesa: req.flash('error'),
        first_type_id: types[Object.keys(types)[0]]._id
      });
    });
  });
};

exports.post_add_products = (req, res, next) => {
  upload(req,res, () => {
    req.checkBody('Product_Name','Tên sản phẩm không được trống (Tối thiểu 1 ký tự, tối đa 120 ký tự).').trim().notEmpty();
    req.checkBody('Product_Name','Tối thiểu 1 ký tự, tối đa 120 ký tự.').isLength({ min: 1, max: 120 });
    req.checkBody('Description','Chi tiết sản phẩm không được trống').trim().notEmpty();
    req.checkBody('Description','Chi tiết sản phẩm tối thiểu là 1 ký tự và nhiều nhất là 3000 ký tự').isLength({ min: 1, max: 3000 });
    req.checkBody('Product_Type','Loại sản phẩm không được trống').trim().notEmpty();
    req.checkBody('Price','Giá không được để trống (Tối thiểu 1, tối đa giá là 9 tỉ)').trim().notEmpty();
    req.checkBody('Price','Giá phải là số').isNumeric();
    req.checkBody('imgs','Không có ảnh nào').trim().notEmpty();
    req.checkBody('Price','Giá (Tối thiểu 1, tối đa giá là 9 tỉ)').isLength({min: 1});
    req.checkBody('Quantity','Số lượng kho không được để trống (Tối thiểu 1, tối đa giá là 9 tỉ)').trim().notEmpty();
    req.checkBody('Quantity','Số lượng kho phải là số').isNumeric();
    req.checkBody('Quantity','Số lượng kho (Tối thiểu 1, tối đa giá là 9 tỉ)').isLength({min: 1});
    var errors = req.validationErrors();
    if(errors) {
      var messages = [];
      errors.forEach((error) => {
        messages.push(error.msg);
      });
      req.flash('error', messages);
      return res.status(302).redirect(config.Path+'san-pham/them-san-pham');
    }
    var sanpham = new Product();
    sanpham.Product_Name = req.body.Product_Name;
    sanpham.Description = req.body.Description;
    sanpham.Seller = req.user._id;
    sanpham.Price = req.body.Price;
    sanpham.Quantity = req.body.Quantity;
    sanpham.Brand = (req.body.Brand) ? (req.body.Brand) : "No Brand";
    sanpham.Product_Type = req.body.Product_Type;
    sanpham.Img_Product = req.body.imgs;
    sanpham.Url_clound = '/images/';
    sanpham.save(function(err) {
      if(err) {
        return res.json(err);
      } else {
        return res.status(302).redirect(config.Path);
      }
    });
  });
};

exports.get_edit_products = (req, res, next) => {
  Product.findById(req.params.id, function(err, docs) {
    if (err) return res.send(err);
    Product_Type.find(function(err, types) {
      if (err) return res.send(err);
      res.render('Page/Product/Edit', {
        title: 'Chỉnh sửa sản phẩm',
        chuto: 'Kênh người bán',
        products: docs ,
        csrfToken: req.csrfToken(),
        Url_clound: docs.Url_clound ,
        mesa: req.flash('error'),
        path: config.Path,
        id: docs.Product_Type,
        type: types
      });
    });
  });
};

exports.post_edit_products = (req, res, next) => {
  upload(req, res, () => {
    req.checkBody('Product_Name','Tên sản phẩm không được trống (Tối thiểu 1 ký tự, tối đa 120 ký tự).').trim().notEmpty();
    req.checkBody('Product_Name','Tối thiểu 1 ký tự, tối đa 120 ký tự.').isLength({ min: 1, max: 120 });
    req.checkBody('Description','Chi tiết sản phẩm không được trống').trim().notEmpty();
    req.checkBody('Description','Chi tiết sản phẩm tối thiểu là 1 ký tự và nhiều nhất là 3000 ký tự').isLength({ min: 1, max: 3000 });
    req.checkBody('Product_Type','Loại sản phẩm không được trống').trim().notEmpty();
    req.checkBody('Price','Giá không được để trống (Tối thiểu 1, tối đa giá là 9 tỉ)').trim().notEmpty();
    req.checkBody('Price','Giá phải là số').isNumeric();
    req.checkBody('Price','Giá (Tối thiểu 1, tối đa giá là 9 tỉ)').isLength({min: 1, max: 9999999999});
    req.checkBody('Quantity','Số lượng kho không được để trống (Tối thiểu 1, tối đa giá là 9 tỉ)').trim().notEmpty();
    req.checkBody('Quantity','Số lượng kho phải là số').isNumeric();
    req.checkBody('imgs','Không có ảnh nào').trim().notEmpty();
    req.checkBody('Quantity','Số lượng kho (Tối thiểu 1, tối đa giá là 9 tỉ)').isLength({min: 1, max: 9999999999});
    var errors = req.validationErrors();
    if(errors) {
      var messages = [];
      errors.forEach((error) => {
        messages.push(error.msg);
      });
      req.flash('error', messages);
      return res.status(302).redirect(config.Path+'san-pham/update-san-pham/'+`${req.params.id}`);
    }
    let editSanpham = {};
    editSanpham.Product_Name = req.body.Product_Name;
    editSanpham.Description = req.body.Description;
    editSanpham.Price = req.body.Price;
    editSanpham.Quantity = req.body.Quantity;
    editSanpham.Brand = (req.body.Brand) ? (req.body.Brand) : "No Brand";
    editSanpham.Product_Type = req.body.Product_Type;
    editSanpham.update_at = new Date().toLocaleDateString();
    editSanpham.Img_Product = req.body.imgs;
    let sp_id = { _id: req.params.id };
    Product.update(sp_id, editSanpham, (err) => {
      if(err) {
        return res.json(err);
      } else {
        return res.status(302).redirect(config.Path+'kenh-nguoi-ban');
      }
    });
  });
};

exports.put_status_products = (req, res, next) => {
  let query_id = { _id: req.body.Id },
      porot = {};
      porot.Enable = req.body.Stuta;
  Product.update(query_id, porot, (err) => {
    if(err) return res.json(err);
    return res.status(200).json('Thành công');
  });
};

// Send Mail for Seller
exports.get_sendMail_products_for_Seller = (req, res, next) => {
  let mes = req.flash('success'),
      loi = req.flash('error');
  Product.findById({ _id: req.params.id }, function(err, poro){
    if(err) return res.send(err);
    Account.findById({ _id: poro.Seller }, function(err, roto) {
      if(err) return res.send(err);
      Product_Type.findOne((err, types) => {
        if(err) return res.send(err);
        let	mulporo,
            propImg = poro.Img_Product,
            position = poro.Img_Product.indexOf(',');
        if(propImg.length !== position) {
          mulporo = propImg.split(",");
        }
        else {
          mulporo = propImg.split(",", 1);
        }
        res.render("Page/gui-mail", {
          title: 'Gửi liên hệ sản phẩm',
          tedieu: 'Gửi liên hệ cho người bán'+ " " + roto.User.Username,
          poro: poro,
          csrfToken: req.csrfToken(),
          Url_clound: poro.Url_clound,
          roto: roto,
          mes: mes,
          loi: loi,
          path: config.Path,
          uid: types._id,
          sl: req.params.sl,
          mulporo: mulporo
        });
      });
    });
  });
};

exports.post_sendMail_products_for_Seller = (req, res, next) => {
  let query = { _id: req.params.id };
  req.checkBody('tieude','Tiêu đề không được trống (Tối thiểu 1 ký tự, tối đa 120 ký tự).').trim().notEmpty();
  req.checkBody('ten','Họ và tên không được trống').trim().notEmpty();
  req.checkBody('sdt','Số diện thoại không được trống').trim().notEmpty();
  req.checkBody('sdt','Số diện thoại phải là số').isNumeric();
  req.checkBody('sdt','Số diện thoại không đúng định dạng.').isLength({min: 9}).matches(/[0-9]{9,16}/);
  req.checkBody('email','Email không được để trống').trim().notEmpty();
  req.checkBody('email','Email không đúng định dạng').isEmail();
  req.checkBody('soluong','Số lượng không được để trống (Tối thiểu 1, tối đa giá là 9 tỉ)').trim().notEmpty();
  req.checkBody('soluong','Số lượng phải là số').isNumeric();
  req.checkBody('noidung','Nội dung không được để trống').trim().notEmpty();
  req.checkBody('noidung','Nội dung tối đa giá là 3000 ký tự').isLength({min: 1, max: 3000});
  if(req.params.kho < req.body.soluong) {
    req.flash('error', "Số lượng không được lớn hơn số lượng kho");
    return res.status(302).redirect(config.Path+'san-pham/gui-mail/'+`${req.params.id}&1`);
  }
  if(req.body.soluong < 0) {
    req.flash('error', "Số lượng phải lớn hơn 0");
    return res.status(302).redirect(config.Path+'san-pham/gui-mail/'+`${req.params.id}&1`);
  }
  var errors = req.validationErrors();
  if(errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });
    req.flash('error', messages);
    return res.status(302).redirect(config.Path+'san-pham/gui-mail/'+`${req.params.id}&${req.body.soluong}`);
  }
  Product.findById(query, function(err, lolo) {
    Account.findById({ _id: lolo.Seller }, function(err, roto) {
      if(err) return res.send(err);
      Product_Type.findOne((err, types) => {
        if(err) return res.send(err);
        let	mulporo,
            propImg = lolo.Img_Product,
            position = lolo.Img_Product.indexOf(',');
        if(propImg.length !== position) {
          mulporo = propImg.split(",");
        }
        else {
          mulporo = propImg.split(",", 1);
        }
      try {
          let mail =	`<div style="width: 60%; padding: 15px; margin: 0 auto; border: 10px solid #262626;">
            <h2 style="color: #01a185"><span><img src="http://chototvanlang.tk/images/favicon.png" width="20px" height="20px"></span><span style="color: #f3c500">Chợ tốt</span> Văn Lang</h2>
            <div class="mail-header" style="background: #01a185; color: white; padding: 30px 0; text-align: center;">
              <h3>Chi tiết liên hệ</h3>
            </div>
            <div style="padding: 0 10px;">
              <h3>Thông tin người mua</h3>
              <ul style="list-style-type: persian;">
                <li>Họ tên: ${req.body.ten}</li>
                <li>Email: ${req.body.email}</li>
                <li>Số điện thoại: ${req.body.sdt}</li>
                <li>Số lượng: ${req.body.soluong} ${req.params.tyle}</li>
              </ul>
            </div>
            <br>
            <div class="mail-body" style="padding: 0 10px;">
              <h3>Thông tin sản phẩm</h3>
              <ul style="list-style-type: persian;">
                <li>Tên sản phẩm: ${ lolo.Product_Name}</li>
                <li>Giá: ${lolo.Price} VNĐ</li>
                <li>Số lượng: ${lolo.Quantity} ${req.params.tyle} còn lại</li>
                <li>Thương hiệu: ${lolo.Brand}</li>
                <li>Tình trạng: ${lolo.Status}</li>
              </ul>
              <br/>
              <br>
              <hr>
              <div style="clear: both;"></div>
              <div style="float: left; width: 60%;">
                <h3>Chợ tốt Văn Lang</h3>
                <ul style="list-style-type: persian;">
                  <li>Địa chỉ: LẦU 7 VĂN PHÒNG KHOA CNTT Đại học Văn Lang</li>
                  <li>Số điện thoại: 0 561 111 235</li>
                  <li>Mọi thắc mắc vui lòng liên hệ: <a href="mailto:w.a.f-group@gmail.com">chototvanlang@gmail.com</a></li>
                  <p> © 2018 Chợ tốt Văn Lang. All Rights Reserved</p>
                </ul>
              </div>
              <div style="float: right; width: 38%; text-align: center">
                <img src="http://chototvanlang.tk/images/favicon.png" width="50%">
              </div>
              <div style="clear: both;"></div>
              <hr style="padding: 0;margin: 0;">
            </div>
             </div>`;

      // create reusable transporter object using the default SMTP transport
       let transporter = nodemailer.createTransport({
           service: 'Gmail',
           auth: {
             user: config.Email,
             pass: config.Password
           },
           tls: {
             rejectUnauthorized: false
           }
       });

       // setup email data with unicode symbols
        let mailOptions = {
            from: "Chợ tốt Văn Lang 👻"+`${roto.email}`, // sender address
            to: `${roto.email}`, // list of receivers
            subject: `${req.body.tieude}`+' ✔', // Subject line
            text: 'Test', // plain text body
            html: mail // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return new Error(error);
            }
            ('Message sent: %s', info.messageId);
            ('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            req.flash('success', "Liên hệ đã được gửi");
            return res.status(302).redirect(config.Path+'san-pham/gui-mail/'+`${req.params.id}&1`);
          });
        } catch (e) {
          res.json("Lỗi thực thi");
        }
      });
    });
  });
};

module.exports.socket = (io) => {
  let count = 0;
  io.on('connection', socket => {
    count++;
    io.sockets.emit("online", count);
    socket.on("disconnect", data => {
      count--;
      io.sockets.emit("online", count);
    });

    socket.on("search",t=>{let e=t.trim().length;0!==e?/\w/.test(t.trim())?Product.find({Product_Name:{$regex:new RegExp(t),$options:"i"}},{Product_Name:1,Price:1},(t,e)=>{t?socket.compress(!0).emit("notfound","Không tìm thấy sản phẩm"):socket.compress(!0).emit("elastic",e)}).limit(10):socket.compress(!0).emit("notfound","Không tìm thấy sản phẩm"):e>128&&socket.compress(!0).emit("notfound","Không tìm thấy sản phẩm")});

    // socket.on('search', data => {
    //   let keyChar = data.trim().length;
    //   if(keyChar !== 0) {
    //     if(/\w/.test(data.trim())) {
    //       Product.find({
    //         Product_Name: {$regex: new RegExp(data), $options: 'i'}
    //       },{Product_Name: 1, Price: 1}
    //       , (err, search_data) => {
    //         if(err) {
    //           socket.compress(true).emit('notfound',"Không tìm thấy sản phẩm");
    //         } else {
    //           socket.compress(true).emit('elastic', search_data);
    //         }
    //       }).limit(10);
    //     } else {
    //       socket.compress(true).emit('notfound',"Không tìm thấy sản phẩm");
    //     }
    //   } else if(keyChar > 128) {
    //     socket.compress(true).emit('notfound',"Không tìm thấy sản phẩm");
    //   }
    // });

    let files = {},
    struct={name:null,size:null,type:null,data:[],slice:0};

    socket.on('uploadAdd', data => {
      uploadImg(data);
    });

    socket.on('uploadEdit', data => {
      uploadImg(data);
    });

    socket.on('resizeAdd', data => {
      resizeImg(data);
    });

    socket.on('resizeEdit', data => {
      resizeImg(data);
    });

    socket.on('delete', data => {
      deleteOne(data);
    });

    socket.on('deleteE', data => {
      deleteOne(data);
    });

    socket.on('deleteAll', data => {
      deleteAll(data);
    });

    socket.on('deleteAllE', data => {
      deleteAll(data);
    });

    let uploadImg = (data) => {
      if (!files[data.name]) {
        files[data.name] = Object.assign({}, struct, data);
        files[data.name].data = [];
      }
      data.data = Buffer.from(new Uint8Array(data.data));
      files[data.name].data.push(data.data);
      files[data.name].slice++;
      if(data.type.match(/jpg|jpeg|png|gif/i)) {
        if (files[data.name].slice * 2097152 >= files[data.name].size) {
            let fileBuffer = Buffer.concat(files[data.name].data),
                hexa = Buffer.from(data.name, 'ascii'),
                imgName = Date.now()+hexa.toString('hex')+path.extname(data.name);
           fs.writeFile('./public/images/'+imgName, fileBuffer, (err) => {
               delete files[data.name];
               if (err) return socket.emit('loi',"Không up được ảnh"+data.name);
               socket.emit('uploadAddS', {filename: imgName});
           });
        } else {
          socket.emit('uploadAddS', {currentImage: data.name});
          return;
        }
      } else {
        socket.emit('uploadAddS', 'Vui lòng chỉ chọn đúng định dạng ảnh&nbsp;<i class="text-primary">( .JPG |.JPEG |.PNG |.GIF )</i>.');
        return;
      }
    }

    let deleteAll = (data) => {
      for (let vakey in data) {
        fs.exists(`./public/images/${data[vakey]}`, (exists) => {
          if (exists) {
            try {
              fs.unlinkSync(`./public/images/${data[vakey]}`);
            } catch (err) {
              socket.compress(true).emit('loi',"Xoá thất bại");
              return;
            }
          } else {
            socket.compress(true).emit('loi',"Ảnh không tồn tại");
            return;
          }
        });
      }
    }

    let deleteOne = (data) => {
      fs.exists(`./public/images/${data}`, (exists) => {
        if (exists) {
          try {
            fs.unlinkSync(`./public/images/${data}`);
            socket.compress(true).emit('thanhcong',"Xoá thành công");
          } catch (err) {
            socket.compress(true).emit('loi',"Xoá thất bại");
            return;
          }
        } else {
          socket.compress(true).emit('loi',"Ảnh không tồn tại");
          return;
        }
      });
    }

    let resizeImg = (data) => {
      let image=data.image,unlink=data.unlink,base64Data=image.replace(/^data:image\/png;base64,/,""),newImg=Date.now()+unlink;
      fs.exists(`./public/images/${unlink}`, (exists) => {
        if (exists) {
          try {
            fs.unlinkSync(`./public/images/${unlink}`);
            fs.writeFile(`./public/images/${newImg}`, base64Data, 'base64', (err) => {
              if(err) {
                  socket.compress(true).emit('loi',"Resize thất bại");
                  return;
              }
              socket.compress(true).emit('resizeThanhcong',{message: "Resize thành công",oldImg: unlink,newImg: newImg});
            });
          } catch (err) {
            socket.compress(true).emit('loi',"Resize thất bại");
            return;
          }
        } else {
          socket.compress(true).emit('loi',"Ảnh không tồn tại");
          return;
        }
      });
    }

  });
}
