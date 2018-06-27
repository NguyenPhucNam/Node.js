const config = require('../config/default');

exports.isLogin = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.originalUrl;
  return res.status(302).redirect(config.Path+'tai-khoan/dang-nhap');
};

exports.isPay = (req, res, next) => {
  if(req.user.User.Status === true) {
    return next();
  }
  return res.status(302).redirect(config.Path+'tai-khoan/cho-duyet');
};

exports.isNotPay = (req, res, next) => {
  if(req.user.User.Status === false) {
    return next();
  }
  req.flash("Success", "Bạn đã trả phí")
  return res.status(302).redirect(config.Path+'kenh-nguoi-ban');
};

exports.verifyToken = (req, res, next) => {
  const tokenHeader = req.headers['authorization'];
  if(typeof tokenHeader !== 'undefined') {
    const tokenAuth = tokenHeader.split(" ")[1];
    req.token = tokenAuth;
    next();
  } else {
    res.sendStatus(403);
  }
};
