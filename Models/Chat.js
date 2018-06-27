'use strict';

const mongoose = require('mongoose');
var Account = require('./Account');
const Schema = mongoose.Schema;

var ChatSchema = new mongoose.Schema({
    Room: {
        Name: {
          type: String,
          required: true,
          trim: true
        },
        Member: {
          Message: {
            member_Id : {
              type: String,
              required: true,
              trim: true
            },
            Content: {
              type: String,
              required: true,
              trim: true
            },
            Status: {
              type: Boolean,
              default: false
            },
            Send: {
              type: Date,
              default: Date.now
            }
          }
        }
    }

});
module.exports = mongoose.model("chat", ChatSchema);
