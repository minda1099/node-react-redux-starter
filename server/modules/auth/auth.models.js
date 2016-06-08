'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const bcrypt = require('bcryptjs');

//USER MODEL
const UserSchema = new Schema({
  id: ObjectId,
  local: {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    password: String,
  },
  facebook: {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    token: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    name: String,
  },
  twitter: {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    token: String,
    displayName: String,
    username: String,
  },
  google: {
    id: {
      type: String,
      unique: true,
      sparse: true,
    },
    token: String,
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    name: String,
  },
  data: Object,
});

UserSchema.pre('save', function(next)  {
  const user = this;
  if(!user.local.password) return next();
  
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.local.password, salt, function(err, hash){
      if (err) return next(err);
      user.local.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candiatePassword, callback) {
  bcrypt.compare(candiatePassword, this.local.password, function(err, isMatch) {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

mongoose.model('User', UserSchema);