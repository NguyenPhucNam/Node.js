"use strict";
const mongoose = require("mongoose");
const Product = require('../Models/Product');
const About = require('../Models/About');
const Product_Type = require('../Models/Product_Type');
const nodemailer = require('nodemailer');
const config = require('../config/default');


exports.home_page = (req, res, next) => {
  Product.find({ Enable: true }, (err, docs) => {
    if(err) { return res.status(404).json("Không tìm thấy sản phẩm đang bán"); }
    Product_Type.find((err, types) => {
      if(err) { return res.status(404).json("Không tìm thấy loại sản phẩm"); }
      let mao = docs.map( (imgEdit) => {
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
      res.render('Page/home', {
        title: 'Chợ tốt Văn Lang',
        products: docs,
        type: types,
        path: config.Path,
        one_type_id: types[Object.keys(types)[0]]._id
       });
    });
  }).limit(12).sort({Create_at: -1});
};

exports.category_page = (req, res, next) => {
  let query = Product_Type.find({});
  Product_Type.findById(req.params.id, (err, type_param) => {
    if (err) return res.status(404).json("Not Found");
      Product.find({ Enable: true }, (err, docs) => {
        if (err) return res.status(404).json("Not Found");
        query.exec((err, allType) => {
          if (err) return res.status(404).json("Not Found");
          let mao = docs.map((imgEdit) => {
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
            res.render('Page/danh-muc', {
              title: 'Danh mục',
              header: 'Chợ tốt Văn Lang',
              subHeader: 'Lựa chọn sản phẩm mà bạn muốn',
              type: allType,
              path: config.Path,
              type_id: type_param._id,
              products: docs });
        });
      }).sort({Create_at: -1});
  });
};

exports.about_page = (req, res, next) => {
  About.findOne((err,about) => {
    if(err) { return res.send(err); }
    let Img_Member = about.Img_Member.split(',');
    res.render('Page/About', {
      title: 'Chợ tốt Văn Lang',
      Title_about: about.Title,
      path: config.Path,
      Description: about.Description,
      Img_Company: about.Img_Company,
      Img_Member: Img_Member,
    });
  });
};

exports.get_contact_page = (req, res, next) => {
  res.render('Page/Contact', {
    title: 'Liên hệ với chúng tôi',
    csrfToken: req.csrfToken(),
    path: config.Path,
    mes: req.flash('success'),
    loi: req.flash('error')
  });
};

exports.post_contact_page = (req, res, next) => {
  req.checkBody('title','Tiêu đề không được trống (Tối thiểu 1 ký tự, tối đa 120 ký tự).').trim().notEmpty();
  req.checkBody('name','Họ và tên không được trống').trim().notEmpty();
  req.checkBody('phone','Số diện thoại không được trống').trim().notEmpty();
  req.checkBody('phone','Số diện thoại phải là số').isNumeric();
  req.checkBody('phone','Số diện thoại không đúng định dạng.').isLength({min: 9}).matches(/[0-9]{9,16}/);
  req.checkBody('email','Email không được để trống').trim().notEmpty();
  req.checkBody('email','Email không đúng định dạng').isEmail();
  req.checkBody('content','Nội dung không được để trống').trim().notEmpty();
  var errors = req.validationErrors();
  if(errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });
    req.flash('error', messages);
    return res.status(302).redirect(config.Path+'lien-he');
  }
  try {
    let mail_company =
    `<div style="width: 60%; padding: 15px; margin: 0 auto; border: 10px solid #262626;">
          <h2 style="color: #01a185"><span><img src="http://chototvanlang.tk/images/favicon.png" width="20px" height="20px"></span><span style="color: #f3c500">Chợ tốt</span> Văn Lang</h2>
          <div class="mail-header" style="background: #01a185; color: white; padding: 30px 0; text-align: center;">
            <h3>Yêu cầu hỗ trợ</h3>
          </div>
          <div style="padding: 0 10px;">
            <h3>Thông tin người mua</h3>
            <ul style="list-style-type: persian;">
                <li>Họ tên: ${req.body.name}</li>
                <li>Email: ${req.body.email}</li>
                <li>Số điện thoại: ${req.body.phone}</li>
            </ul>
            <h3>Nội dung</h3>
            <p>${req.body.content}</p>
          </div>
          <br>
          <div class="mail-body" style="padding: 0 10px;">
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

      let transporter_company = nodemailer.createTransport({
         service: 'Gmail',
         auth: {
           user: config.Email,
           pass: config.Password
         },
         tls: {
           rejectUnauthorized: false
         }
      });

      let mailOptions_company = {
          from: "Chợ tốt Văn Lang 👻" + `${req.body.email}`, // sender address
          to: 'nnam1472@gmail.com', // list of receivers
          subject: `${req.body.title}`+' ✔', // Subject line
          text: 'Test', // plain text body
          html: mail_company // html body
      };

      // send mail with defined transport object
      transporter_company.sendMail(mailOptions_company, (error, info_user) => {
          if (error) {
            return new Error(error);
          }
          ('Message sent: %s', info_user.messageId);
          ('Preview URL: %s', nodemailer.getTestMessageUrl(info_user));

          req.flash('success', "Liên hệ của bạn đã được gửi cho chúng tôi.");
          return res.status(302).redirect(config.Path+'lien-he');
      });
  } catch (e) {
    res.json("Lỗi thực thi");
  }
};

// Seller
exports.get_kenh_nguoi_ban = (req, res, next) => {
  Product.find({$and: [{ Seller: req.user._id }, { Enable: true }] },(err, docs) => {
    if (err) return res.status(404).json(err);
    Product_Type.find((err, types) => {
      if (err) return res.status(404).json(err);
      Product.find({$and: [{ Seller: req.user._id }, { Enable: false }] },(err, docsD) => {
        if (err) return res.status(404).json(err);
        docs.map((imgEdit) => {
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
        docsD.map((imgEdit) => {
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
        res.render('Page/kenh-nguoi-ban', {
          title: 'Kênh người bán',
          csrfToken: req.csrfToken(),
          products: docs ,
          productsD: docsD ,
          path: config.Path,
          type: types
        });
      });
    });
  }).sort({Create_at: -1});
};

exports.get_het_han = (req, res, next) => {
  res.render('het-han', {
      title: 'Hết hạn',
      path: config.Path,
      message: req.flash('e').toString()
  });
};
