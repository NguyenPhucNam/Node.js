"use strict";
const mongoose = require("mongoose");
const Account = require('../Models/Account');
const Product = require('../Models/Product');
const Product_Type = require('../Models/Product_Type');
const config = require('../config/default');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const nodemailer = require('nodemailer');


exports.get_forgot_pass = (req, res, next) => {
  var messages = req.flash('error');
  res.render('Page/getPass', {
    title: 'Lấy lại mật khẩu',
    messages: messages,
    path: config.Path,
    csrfToken: req.csrfToken(),
    success: req.flash('Success'),
    hasErrors: messages.length > 0 });
};

exports.post_forgot_pass = (req, res, next) => {
  let email = req.body.email;
  req.checkBody('email','Email không đúng').trim().notEmpty().isEmail();
  Account.findOne({ email: email }, (err, account) => {
      if (err) { return res.send(err); }
      if (!account) {
          req.flash('error','Rất tiếc! Tài khoản không tồn tại');
          return res.status(302).redirect(config.Path+'tai-khoan/lay-mat-khau');
      }
      try {

        const emailToken = jwt.sign({account}, 'secretkey', {expiresIn: '15m'});
          const url = `http://chototvanlang.tk${config.Path}tai-khoan/doi-mat-khau/${emailToken}`;


          const laymk =
          `	<div style="width: 60%; padding: 15px; margin: 0 auto; border: 10px solid #262626;">
            <h2 style="color: #01a185"><span><img src="http://chototvanlang.tk/images/favicon.png" width="20px" height="20px"></span><span style="color: #f3c500">Chợ tốt</span> Văn Lang</h2>
            <div class="mail-header" style="background: #01a185; color: white; padding: 30px 0; text-align: center;">
              <h3>Yêu cầu đặt lại mật khẩu cho Tài khoản Chợ tốt Văn Lang của bạn</h3>
            </div>
            <div>
              <p>	Bạn nhận được thông báo này vì ${account.email} được liệt kê là email khôi phục mật khẩu cho tài khoản Chợ tốt Văn Lang ${req.body.email}. Nếu ${req.body.email} không phải là tài khoản Chợ tốt Văn Lang của bạn, hãy xoá chúng và xin lỗi vì đã làm phiền bạn.</p>
            </div>
            <hr>
            <div class="mail-body" style="padding: 0 10px;">
              <p>Xin chào ${account.User.Username}!</p>
              <p>Chúng tôi vừa nhận được một yêu cầu khôi phục tài khoản Chợ tốt Văn Lang ${account.email}.</p>
              <p>Để thực hiện yêu cầu này, hãy nhấp vào <a href="` +  `${url}` + `" style="color: #01a185;">
              liên kết này</a> để thực hiện yêu cầu
              </p>
              <p style="color: red;">Liên kết chỉ tồn tại 15 phút</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
              <br/>
              <br>
              <br>
              <div>Trân trọng,</div>
              <div>Admin</div>
              <div>Hỗ trợ tài khoản</div>
              <p> © 2018 Chợ tốt Văn Lang. All Rights Reserved</p>
              <hr style="padding: 0;margin: 0;">
            </div>
             </div>`;

        let transporter_mk = nodemailer.createTransport({
           service: 'Gmail',
           auth: {
               user: config.Email,
               pass: config.Password
           },
           tls: {
             rejectUnauthorized: false
           }
        });

        let mailOptions_mk = {
            from: "Chợ tốt Văn Lang 👻"+ ` ${account.email}`, // sender address
            to: `${req.body.email}`, // list of receivers
            subject: 'Yêu cầu khôi phục tài khoản Chợ tốt Văn Lang', // Subject line
            text: 'Test', // plain text body
            html: laymk // html body
        };

        // send mail with defined transport object
        transporter_mk.sendMail(mailOptions_mk, (error, info_user) => {

            if (error) {
                return res.send(error);
            }
            ('Message sent: %s', info_user.messageId);
            ('Preview URL: %s', nodemailer.getTestMessageUrl(info_user));

            req.flash('Success','thành công');
            return res.status(302).redirect(config.Path+'tai-khoan/lay-mat-khau');
        });
      } catch (e) {
        res.json("Gửi mail thất bại");
      }
  });
};

exports.get_change_pass = (req, res, next) => {
  try {
    let mes = req.flash('errors');
    jwt.verify(req.params.token, 'secretkey', (err, user) => {
      if(err) {
        req.flash('e', 'Yêu cầu của bạn đã hết hạn. Vui lòng gửi yêu cầu mới');
        return res.status(302).redirect(config.Path+'het-han');
      }
        res.render('Page/resetmk', {
          title: 'Đổi mật khẩu',
          Token: req.params.token,
          csrfToken: req.csrfToken(),
          user: user.account,
          messages: mes,
          path: config.Path,
          success: req.flash('Success'),
          hasErrors: mes.length > 0
        });
        return;
    });
  } catch (e) {
    req.flash('e', 'Phiên làm việc đã hết hạn. Vui lòng gửi yêu cầu mới');
    return res.status(302).redirect(config.Path+'het-han');
  }
};

exports.post_change_pass = (req, res, next) => {
  try {
    jwt.verify(req.params.token, 'secretkey', (err, user) => {
      let newPassword = req.body.newPassword,
          query = {_id: user.account._id};
      req.check('newPassword','Password không khớp').notEmpty().isLength({min: 6, max: 25}).equals(req.body.confirmNewpassword);
      let loi = req.validationErrors();
      if(loi) {
        let mes = [];
        loi.forEach((errors) => {
          mes.push(errors.msg);
        });
        req.flash('errors', mes);
        return res.status(302).redirect(config.Path+'tai-khoan/doi-mat-khau/'+req.params.token);
      }
      let updatePass = {};
      updatePass.password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);
      Account.update(query, updatePass, (err) => {
        if (err) return res.send(err);
        req.flash('mk', 'Đổi mật khẩu thành công');
        return res.status(302).redirect(config.Path+'tai-khoan/dang-nhap');
      });
    });
  } catch(e) {
    return res.send(e);
  }
};

exports.get_sign_in = (req, res, next) => {
  var messages = req.flash('error');
  res.render('Page/Login', {
    title: 'Đăng nhập',
    user: req.account,
    csrfToken: req.csrfToken(),
    messages: messages,
    path: config.Path,
    mk: req.flash('mk'),
    hasErrors: messages.length > 0 });
};

exports.post_sign_in = (req, res, next) => {
  if(req.session.oldUrl) {
    let currentUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    if(currentUrl == (config.Path+"admin/dang-nhap")) {
      return res.status(302).redirect(config.Path);
    } else {
      return res.status(302).redirect(currentUrl);
    }
  } else {
    return res.status(302).redirect(config.Path);
  }
};

exports.get_sign_up = (req, res, next) => {
  var messages = req.flash('error');
  res.render('Page/Register', {
    title: 'Đăng ký',
    messages: messages,
    path: config.Path,
    csrfToken: req.csrfToken(),
    hasErrors: messages.length > 0 });
};

exports.post_sign_up = (req, res, next) => {
  if(req.session.oldUrl) {
    let currentUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    return res.status(302).redirect(currentUrl);
  } else {
    return res.status(302).redirect(config.Path+'tai-khoan/cho-duyet');
  }
};

exports.get_logout = (req, res, next) => {
  req.logout();
  req.session.destroy(() => {
    res.clearCookie("connect.sid", {
      httpOnly: true,
      maxAge: new Date(),
      expires: new Date(),
    }).status(302).redirect(config.Path);
  });
};

exports.get_profile_user = (req, res, next) => {
  res.render('Page/profile', {
    title: 'Thông tin cá nhân',
    path: config.Path,
   account: req.user });
};

exports.get_approve_account = (req, res, next) => {
  res.render('Page/cho-duyet', { title: 'Chờ duyệt',
  path: config.Path,
   user: req.user });
};
