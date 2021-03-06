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

mongoose.model('User', UserSchema);