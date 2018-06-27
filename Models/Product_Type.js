'use strict';

var mongoose = require('mongoose');
// var Product = require('./Product');
var Schema = mongoose.Schema;

var Product_typeSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Icon: {
        type: String,
        required: true
    },
});
module.exports = mongoose.model("product_type", Product_typeSchema);
