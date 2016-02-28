'use strict';
var mongoose = require('mongoose'),
    User = mongoose.model('User');

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('../config/secret.config');
var secret = config.secret;

exports.register = function(req, res, next) {

    if (!req.body.email || !req.body.password) {
        res.status(400).json({
            success: false,
            error: 'missing email or password'
        });
    } else {
        var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

        var user = new User({
            'local.email': req.body.email,
            'local.password': hash
        });
        user.save(function(err) {
            if (err) {
                var error = 'unknown error, please try again';

                if (err.code === 11000) {
                    error = 'email is already used, please try another';
                }
                res.status(400).json({
                    success: false,
                    error: error
                });

            } else {
                //add new data to req for create JWT
                req.body.newData = {};
                user = user.toObject(); //convert to object
                req.body.newData.user = user;
                req.body.newData.message = 'registration success'; //set response message for jwt middleware
                next();
            }
        });
    }
};

exports.login = function(req, res, next) {
    if (!req.body.email || !req.body.password) {
        res.status(400).json({
            success: false,
            error: 'missing email or password'
        });
    } else {
        User.findOne({
            'local.email': req.body.email
        }, function(err, user) {
            if (!user) {
                res.status(400).json({
                    success: false,
                    error: 'incorrect email or password'
                });


            } else if (user && err) {
                res.status(400).json({
                    success: false,
                    error: 'unknown error'
                });

            } else {
                if (bcrypt.compareSync(req.body.password, user.local.password)) {

                    //add new data to req for create JWT
                    req.body.newData = {};
                    user = user.toObject(); //convert to object
                    req.body.newData.user = user;
                    req.body.newData.message = 'login success'; //set response message for jwt middleware
                    next();

                } else {
                    res.status(400).json({
                        success: false,
                        error: 'incorrect email or password'
                    });
                }
            }
        });
    }
};

exports.fbLogin = function(req, res, next) {
    if (!req.body.id || !req.body.accessToken) {
        res.status(400).json({
            success: false,
            error: 'error with your facebook aith'
        });
    } else {
        //CHECK IF FACEBOOK ACCESS TOKEN IS REAL?

        var fbQuery = {
            'facebook.id': req.body.id
        };

        User.findOne(fbQuery, function(err, user) {
            if (err) {
                if (err.code === 11000) { //users with id already in db
                    //facebook.id exsits in db?  confirm it is users if not return already connected to an account
                } else {
                    res.status(400).json({
                        success: false,
                        error: 'unknown error, please try again'
                    });
                }
            } else { //no users with facebook.id
                checkJwt(req, function(err, data) {
                    var email = req.body.email;
                    if(!email) email = null;
                    if (err) {//not logged in - create new user
                        let fbInfo = {
                            'facebook.id'   : req.body.id,
                            'facebook.token': req.body.accessToken,
                            'facebook.email': req.body.email,
                            'local.email'   : req.body.email
                        };

                        var user = new User(fbInfo);
                        user.save(function(err) {
                            if (err) {
                                var error = 'unknown error, please try again';
                                if (err.code === 11000) {
                                    error = 'email is already used, please try another';
                                } 
                                res.status(400).json({
                                    success: false,
                                    error: error
                                });
                               
                            } else {
                                //add new data to req for create JWT
                                req.body.newData = {};
                                user = user.toObject(); //convert to object
                                user.hasFb = true;
                                req.body.newData.user = user;
                                req.body.newData.message = 'facebook signup success'; //set response message for jwt middleware
                                next();
                            }
                        });
                    } else {//is logged in - add to existing user
                        var currentUser = {
                            'local.email': data.email
                        };
                        let fbInfo = {
                            'facebook.id'   : req.body.id,
                            'facebook.token': req.body.accessToken,
                            'facebook.email': req.body.email
                        };
                        
                        User.findOneAndUpdate(currentUser, fbInfo, function(err, user) {
                            if (err) {
                                var error = 'unknown error, please try again';
                                if (err.code === 11000) {
                                    error = 'email is already used, please try another';
                                } 
                                res.status(400).json({
                                    success: false,
                                    error: error
                                });
                            } else {
                                //add new data to req for create JWT
                                req.body.newData = {};
                                user = user.toObject(); //convert to object
                                user.hasFb = true;
                                req.body.newData.user = user;
                                req.body.newData.message = 'facebook connection success'; //set response message for jwt middleware
                                next();
                            }
                        });
                    }
                });
            }
        });
    }
};

exports.updateEmail = function(req, res, next) {
    //check if body has newEmail and password
    if (!req.body.newEmail || !req.body.password) {
        res.status(400).json({
            success: false,
            error: 'please include newEmail and password'
        });
    } else {
        var userEmailQuery = {
            'local.email': req.decoded.email
        };
        var newEmailQuery = {
            'local.email': req.body.newEmail
        };
        User.findOne(userEmailQuery, function(err, user) {
            if (err) {
                res.status(400).json({
                    success: false,
                    error: 'unknown error'
                });
            }
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.local.password)) {
                    User.findOne(newEmailQuery, function(err, user) {
                        if (err) {

                            res.status(400).json({
                                success: false,
                                error: 'unknown error, please try again'
                            });

                        }
                        if (!user) {
                            User.findOneAndUpdate(userEmailQuery, newEmailQuery, function(err, user) {
                                if (err) {
                                    var error = 'unknown error, please try again';
                                    res.status(400).json({
                                        success: false,
                                        error: error
                                    });
                                }

                                //add new data to req for create JWT
                                req.body.newData = {};
                                user = user.toObject(); //convert to object
                                user.local.email = req.body.newEmail; //make sure new email is set on user.email
                                req.body.newData.user = user; //add user to newData
                                req.body.newData.message = 'email updated'; //set response message for jwt middleware
                                next();

                            });
                        } else {
                            res.status(400).json({
                                success: false,
                                error: 'That email is already taken, please try another.'
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        error: 'password incorrect'
                    });
                }
            } else {
                res.json({
                    success: false,
                    error: 'invalid token'
                });
            }
        });
    }
};

exports.updatePassword = function(req, res, next) {
    //check if body has passwords
    if (!req.body.currentPass || !req.body.newPass) {
        res.status(400).json({
            success: false,
            error: 'please include passwords'
        });
    } else {
        var userEmailQuery = {
            'local.email': req.decoded.email
        };
        User.findOne(userEmailQuery, function(err, user) {
            if (err) {
                res.status(400).json({
                    success: false,
                    error: 'unknown error'
                });
            }

            //NEED TO HANDLE IF req.decoded.hasPass = false for oAuth users'
            if (!user) {
                res.status(400).json({
                    success: false,
                    error: 'unknown error'
                });
            } else {
                if (bcrypt.compareSync(req.body.currentPass, user.local.password)) {
                    var newHash = bcrypt.hashSync(req.body.newPass, bcrypt.genSaltSync(10));

                    User.findOneAndUpdate(userEmailQuery, {
                        'local.password': newHash
                    }, function(err, doc) {
                        if (err) throw err;

                        //add new data to req for create JWT
                        req.body.newData = {};
                        user = user.toObject(); //convert to object
                        req.body.newData.user = user;
                        req.body.newData.message = 'password updated'; //set response message for jwt middleware
                        next();

                    });

                } else {
                    res.status(400).json({
                        success: false,
                        error: 'current password incorrect'
                    });
                }
            }
        });
    }
};

//middleware for checking if users if authenticated
exports.requireAuth = function(req, res, next) {
    checkJwt(req, function(err, data) {
        if (err) {
            return res.status(403).json({
                success: false,
                error: err
            });
        } else {
            //has token
            req.decoded = data;
            next();
        }
    });
};

//middleware for create JWT response
exports.createJwt = function(req, res, next) {

    var message;
    var user = req.body.newData.user;
    if (req.body.newData.message) {
        message = req.body.newData.message;
    } else {
        message = null;
    }

    if (user.local && user.local.email) { //check for local and local email
        user.email = user.local.email;
    }

    if (!user.local || !user.local.password) {
        user.hasPass = false;
    } else {
        user.hasPass = true;
    }
    
    if(!user.hasFb){
        user.hasFb = false;
    }

    delete user.local; //remove local prop
    delete user.facebook; //remove facebook prop
    delete user.__v; //remove versionKey prop

    //create jwt
    var token = jwt.sign(user, secret, {
        expiresIn: 1440 * 60 // expires in 24 hours
    });

    res.status(200).json({
        success: 'true',
        message: message,
        token: token
    });

};

function checkJwt(req, callback) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // has token
    if (token) {
        // decodes,checks secret and experation
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                let error = 'failed to authenticate token';
                callback(error);
            } else {
                callback(null, decoded);
            }
        });

    } else {
        // handle no token
        let error = 'no token provided';
        callback(error);
    }
}