'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');


var AccountSchema = new mongoose.Schema({
    Admin: {
      isAdmin: {
        type: Boolean,
        default: false
      },
      Name: {
          type: String,
          default: 'Admin'
      },
      Info: {
          type: String,
          default: 'Admin'
      },
      Img_Admin: {
          type: String,
          default: 'main.png'
      },
    },

    User: {
        Username: {
            type: String,
            required: true,
            trim: true
        },
        Info: {
            type: String,
            default: '',
            trim: true
        },
        Phone: {
          type: Number,
          default: '',
          trim: true
        },
        Avatar_Img: {
          type: String,
          default: 'img.jpg'
        },
        Status: {
            type: Boolean,
            default: false
        }
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
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

AccountSchema.path('User.Username').set((Username) => {
  return Username[0].toUpperCase() + Username.slice(1);
});

AccountSchema.path('Admin.Name').set((Admin) => {
  return Admin[0].toUpperCase() + Admin.slice(1);
});

AccountSchema.methods.encryptPassword = function(password,err,done) {
  if(err) { return done("Lỗi mã hoá mật khẩu" + err); }
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

AccountSchema.methods.validPassword = function(password) {
    if(this.password != null) {
      return bcrypt.compareSync(password, this.password);
    } else {
      return false;
    }
};

module.exports = mongoose.model("account", AccountSchema);
