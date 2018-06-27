'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var AboutSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Img_Company: {
      type: String,
      required: true
    },
    Img_Member: {
      type: String,
      required: true
    },
    Create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("about", AboutSchema);
