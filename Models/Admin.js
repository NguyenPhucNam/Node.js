'use strict';

var mongoose = require('mongoose');
// var Account = require('./Account');
var Schema = mongoose.Schema;

var AdminSchema = new mongoose.Schema({
    // Admin_Account_id: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Account'
    // }],
    Name: {
        type: String,
        required: true
    },
    Info: {
        type: String
    },
    Phone: {
      type: Number
    },
    Avatar_Img: {
      type: String,
      default: '../images/main.png'
    }
});
module.exports = mongoose.model("admin", AdminSchema);
