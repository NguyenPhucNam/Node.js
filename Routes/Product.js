"use strict";
const express = require("express");
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controller/products');

//Has not checkAuth User
router.get("/chi-tiet-san-pham/:id", ProductsController.get_detail_products_from_Id);

router.get("/gui-mail/:id&:sl", ProductsController.get_sendMail_products_for_Seller);

router.post("/gui-mail/:id&:tyle&:kho", ProductsController.post_sendMail_products_for_Seller);


//Has checkAuth Seller
router.get("/them-san-pham", checkAuth.isLogin, checkAuth.isPay, ProductsController.get_add_products);

router.post("/them-san-pham", checkAuth.isLogin, checkAuth.isPay, ProductsController.post_add_products);

router.get("/update-san-pham/:id", checkAuth.isLogin, checkAuth.isPay, ProductsController.get_edit_products);

router.post("/update-san-pham/:id", checkAuth.isLogin, checkAuth.isPay, ProductsController.post_edit_products);

router.put("/mo-ban", checkAuth.isLogin, checkAuth.isPay, ProductsController.put_status_products);

router.put("/tam-ngung", checkAuth.isLogin, checkAuth.isPay, ProductsController.put_status_products);

module.exports = router;
