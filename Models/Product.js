'use strict';

var mongoose = require('mongoose');
var Account = require('./Account');
var Schema = mongoose.Schema;


var ProductSchema = new mongoose.Schema({
    Seller: {
        type: String,
        required: true,
        trim: true
    },
    Product_Type: {
        type: String,
        required: true,
        trim: true
    },
    Product_Name: {
        type: String,
        default: '',
        trim: true
    },
    Brand: {
      type: String,
      required: true
    },
    Price: {
      type: Number,
      required: true
    },
    Quantity: {
      type: Number,
      required: true
    },
    Description: {
      type: String,
      default: '',
      trim: true
    },
    Img_Product: {
      type: String,
      default: 'main.png'
    },
    Url_clound: {
      type: String,
      required: true
    },
    Enable: {
      type: Boolean,
      default: true
    },
    Status: {
      type: [{
        type: String,
        enum: ['Mới','Đã qua sử dụng']
      }],
      default: ['Mới']
    },
    Create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
    }
});

// ProductSchema.path('Product_Name').set((Product_Name) => {
//   return Product_Name[0].toUpperCase() + Product_Name.slice(1);
// });

ProductSchema.path('Brand').set((Brand) => {
  return Brand[0].toUpperCase() + Brand.slice(1);
});


module.exports = mongoose.model("product", ProductSchema);
