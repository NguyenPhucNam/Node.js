"use strict";
const express = require("express");
const router = express.Router();
const passport = require('passport');
const config = require('../config/default');
const checkAuth = require('../middleware/check-auth');
const UserController = require('../controller/user');

router.get("/dang-nhap", UserController.get_sign_in);

router.post("/dang-nhap", passport.authenticate('dang-nhap', {
  failureRedirect: config.Path+'tai-khoan/dang-nhap',
  failureFlash: true
}), UserController.post_sign_in);

router.get("/dang-ky", UserController.get_sign_up);

router.post("/dang-ky", passport.authenticate('dang-ky', {
  failureRedirect: config.Path+'tai-khoan/dang-ky',
  failureFlash: true
}), UserController.post_sign_up);

router.get("/lay-mat-khau", UserController.get_forgot_pass);

router.post("/lay-mat-khau", UserController.post_forgot_pass);

router.get("/doi-mat-khau/:token", UserController.get_change_pass);

router.post("/doi-mat-khau/:token", UserController.post_change_pass);

router.get("/dang-xuat", checkAuth.isLogin, UserController.get_logout);

router.get("/thong-tin-ca-nhan", checkAuth.isLogin, UserController.get_profile_user);

router.get("/cho-duyet", checkAuth.isLogin, checkAuth.isNotPay, UserController.get_approve_account);

module.exports = router;
