'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;



//USER MODEL
var UserSchema = new Schema({
    id: ObjectId,
    email: {
        type: String,
        required: '{PATH} is required.',
        unique: true
    },
    password: {
        type: String,
        required: '{PATH} is required.'
    },
    data: Object,
});


mongoose.model('User', UserSchema);
