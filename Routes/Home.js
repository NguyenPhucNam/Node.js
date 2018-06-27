"use strict";
const express = require("express");
const router = express.Router();
const path = require('path');
const config = require('../config/default');
const checkAuth = require('../middleware/check-auth');
const HomeController = require('../controller/home');

router.get("/", HomeController.home_page);

router.get("/danh-muc/:id", HomeController.category_page);

router.get("/gioi-thieu", HomeController.about_page);

router.get("/lien-he", HomeController.get_contact_page);

router.post("/lien-he", HomeController.post_contact_page);

// Seller
router.get("/kenh-nguoi-ban", checkAuth.isLogin, checkAuth.isPay, HomeController.get_kenh_nguoi_ban);

//het-han
router.get("/het-han", HomeController.get_het_han);
//
// router.get("/public/*", (req,res,next) => {
//   res.send(path.join(__dirname, '../'+config.Path+'/public/css/all.css'));
// });

module.exports = router;
