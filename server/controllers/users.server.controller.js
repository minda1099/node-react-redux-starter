'use strict';
var mongoose    = require('mongoose'),
    User        = mongoose.model('User');

var bcrypt      = require('bcryptjs');
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var secret      = require('../config/secret.config').secret;

exports.register = function(req, res, next) {
    
    if(!req.body.email || !req.body.password){
        res.status(400).json({
              success: 'false',
              error: 'missing password or email'
        });
    }
    
    var hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    
    var user = new User({
        email: req.body.email,
        password: hash,
    });
    user.save(function(err) {
        if (err) {
            console.log(err);
            var error = 'unknown error, please try again';

            if (err.code === 11000) {
                error = 'That email is already taken, please try another.';
            }
            res.status(400).json({
              success: 'false',
              error: error
            });

        } else {
            user = user.toObject(); //convert to object
            delete user.password; //remove password prop
            delete user.__v; 
            //create jwt
            var token = jwt.sign(user, secret, {
              expiresIn: 1440 * 60// expires in 24 hours
            });

            // return the information including token as JSON
            res.status(200).json({
              success: true,
              message: 'welcome',
              token: token
            });
        }
    });

};

exports.login = function(req, res, next) {

    User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
            res.status(400).json({
                  success: 'false',
                  error: 'incorrect email or password'
            });            
            
            
        } else if (user && err) {
            res.status(400).json({
                  success: 'false',
                  error: 'unknown error'
            });  
            
        } else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                user = user.toObject(); //convert to object
                delete user.password; //remove password prop
                delete user.__v; 
                //create jwt
                var token = jwt.sign(user, secret, {
                  expiresIn: 1440 * 24// expires in 24 hours
                });
    
                // return the information including token as JSON
                res.status(200).json({
                  success: true,
                  message: 'welcome',
                  token: token
                });
            } else {
                res.status(400).json({
                      success: 'false',
                      error: 'incorrect email or password'
                }); 
            }
        }
    });

};

exports.updateEmail = function(req, res, next) {
    if (!req.body) console.log('no body');

    var userEmailQuery = { email: req.decoded.email };
    var newEmailQuery = { email: req.body.newEmail };
    User.findOne(userEmailQuery, function(err, user) {
        if (err) throw err;
        if(user){
            if (bcrypt.compareSync(req.body.password, user.password)) {
                User.findOne(newEmailQuery, function(err, user) {
                    if (err) {
       
                        res.status(400).json({
                          success: 'false',
                          error: 'unknown error, please try again'
                        });
            
                    }
                    if (!user){
                        User.findOneAndUpdate(userEmailQuery, newEmailQuery, function(err, user){
                            if (err) {
                                var error = 'unknown error, please try again';
                                res.status(400).json({
                                  success: 'false',
                                  error: error
                                });
                            }
                            user = user.toObject(); //convert to object
                            user.email = req.body.newEmail;
                            delete user.password; //remove password prop
                            delete user.__v; 
        
                            //create jwt
                            console.log(user);
        
                            var token = jwt.sign(user, secret, {
                              expiresIn: 1440 * 60// expires in 24 hours
                            });                    
                        
                            res.status(200).json({
                              success: 'true',
                              message: 'email updated',
                              token: token
                        }); 
                    });
                    } else {
                        res.status(400).json({
                          success: 'false',
                          error: 'That email is already taken, please try another.'
                        });
                    }
                });
            } else {
                res.status(400).json({
                      success: 'false',
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
};

exports.updatePassword = function(req, res, next) {
    
    var userEmailQuery = { email: req.decoded.email };  
    User.findOne(userEmailQuery, function(err, user) {
        if(err) throw err; 
            
        
            if (bcrypt.compareSync(req.body.oldPassword, user.password)) {
                var newHash = bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(10));
                
                User.findOneAndUpdate(userEmailQuery, { password: newHash }, function(err, doc){
                    if (err) throw err;
                        res.status(200).json({
                          success: 'true',
                          message: 'password updated'
                    }); 
                });

            } else {
                res.status(400).json({
                      success: 'false',
                      error: 'old password incorrect'
                }); 
            }
       
    });
};

//middleware for checking if users if authenticated
exports.requireLogin = function(req, res, next){
// check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // has token
  if (token) {
    // decodes,checks secret and experation
    jwt.verify(token, secret, function(err, decoded) {      
      if (err) {
        return res.json({ 
            success: false, 
            error: 'failed to authenticate token'
        });    
      } else {
        // save decoded token for reuse in routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {
    // handle no token
    return res.status(403).json({ 
        success: false, 
        error: 'no token provided' 
    });
    
  }
};