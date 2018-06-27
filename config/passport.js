var passport = require('passport'),
    Account = require('../Models/Account'),
    LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose');

passport.serializeUser((account, done) => {
  done(null, account.id);
});

passport.deserializeUser((id, done) => {
  Account.findById(id, (err, account) => {
    done(err, account);
  });
});


// Đăng ký
passport.use('dang-ky', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  req.checkBody('username','Họ tên không được trống (Tối thiểu 1 ký tự, tối đa 35 ký tự).').trim().notEmpty().isLength({ min: 1, max: 35 }).matches(/([A-Za-z0-9]{1,35})/, "i");
  req.checkBody('phone','Họ tên không được có ký tự đặc biệt').notEmpty().trim().isLength({min: 9}).matches(/([0-9]{9,16})/, "i");
  req.checkBody('email','Email không đúng').notEmpty().isEmail().trim();
  req.checkBody('password','Password phải từ 6 ký tự trở lên.(Tối đa: 25 ký tự).').notEmpty().isLength({min: 6, max: 35});
  req.checkBody('password','Password không khớp').notEmpty().isLength({min: 6, max: 35}).equals(req.body.confirmPassword);
  var errors = req.validationErrors();
  if(errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  Account.findOne({ 'email': email }, (err, account) => {
      if (err) { return done(err); }
      if (account) { return done(null, false, {message: 'Rất tiếc. Tài khoản đã có người đăng ký'}); }
      var newAccount = new Account();
      newAccount.User.Username = req.body.username;
      newAccount.User.Phone = req.body.phone;
      newAccount.email = email;
      newAccount.password = newAccount.encryptPassword(password);
      newAccount.save(function(err, result) {
        if(err) { return done(err); };
        return done(null, newAccount);
      });
    });
  }
));


// Đăng nhập
passport.use('dang-nhap', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  req.checkBody('email','Email không đúng').notEmpty().isEmail();
  req.checkBody('password','Password Lỗi').notEmpty().isLength({min: 6, max: 35});
  var errors = req.validationErrors();
  if(errors) {
    var messages = [];
    errors.forEach((error) => {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  Account.findOne({ 'email': email }, (err, account) => {
      if (err) { return done(err); }
      if (!account) {
        return done(null, false, {message: 'Rất tiếc! Tài khoản không tồn tại'});
      }
      if(!account.validPassword(password)) {
        return done(null, false, {message: 'Sai password.'});
      }
      return done(null, account);
    });
  }
));
