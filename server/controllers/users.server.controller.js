'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var graph = require('fbgraph');
    graph.setVersion('2.4');
    
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var plus = google.plus('v1');

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
      error: 'your request is missing information'
    });
  } else {
    var fbAccessToken = req.body.accessToken,
      fbId = req.body.id,
      fbEmail = req.body.email || null; //for users who don't allow email to be given

    //CHECK IF FACEBOOK ACCESS TOKEN IS AUTHENTIC 
    graph.extendAccessToken({
      'access_token': fbAccessToken,
      'client_id': config.facebookAuth.clientID,
      'client_secret': config.facebookAuth.clientSecret
    }, function(err, facebookRes) {
      if (err) { // NOT AUTHENTIC
        res.status(400).json({
          success: false,
          error: err.message
        });
      } else { //IS AUTHENTIC
        fbAccessToken = facebookRes.access_token; //Set token to refreshed token
        var isAuth, newFbUser, fbInfo;
        //CHECK IF USER IS AUTHENTICATED via JWT
        checkJwt(req, function(err, data) {
          if (err) { //Not Authenticated 
            isAuth = false; //user is not logged in
          } else {
            var userEmail = data.email; //logged in user email
            isAuth = true; //user is logged in
          }
          var fbQuery = {
            'facebook.id': fbId
          };
          //CHECK IF Request Facebook Id is in Database
          User.findOne(fbQuery, function(err, user) {
            if (err) {} else {
              if (user === null) { //FB id is not in DB
                newFbUser = true;

              } else { //FB id is in DB
                newFbUser = false;
              }
              if (isAuth && newFbUser) { // add to logged-in account
                var currentUser = {
                  'local.email': userEmail
                };
                fbInfo = {
                  'facebook.id': fbId,
                  'facebook.token': fbAccessToken,
                  'facebook.email': fbEmail,
                };

                User.findOneAndUpdate(currentUser, fbInfo, function(err, user) {
                  if (err) {
                    res.status(400).json({
                      success: false,
                      error: 'unknown error, please try again'
                    });
                  } else {
                    req.body.newData = {};
                    user = user.toObject(); //convert to object
                    user.hasFb = true;
                    req.body.newData.user = user;
                    req.body.newData.message = 'facebook connection success'; //set response message for jwt middleware
                    next();
                  }
                });
              }
              if (isAuth && !newFbUser) { // error 'this Facebook account is already linked to a user'
                res.status(400).json({
                  success: false,
                  error: 'this Facebook account is already linked to a user'
                });
              }
              if (!isAuth && newFbUser) { // sign up - add to db
                fbInfo = {
                  'facebook.id': fbId,
                  'facebook.token': fbAccessToken,
                  'facebook.email': fbEmail,
                  'local.email': fbEmail
                };
                var newUser = new User(fbInfo);
                newUser.save(function(err) {
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
                    newUser = newUser.toObject(); //convert to object
                    newUser.hasFb = true;
                    req.body.newData.user = newUser;
                    req.body.newData.message = 'facebook signup success'; //set response message for jwt middleware
                    next();
                  }
                });
              }
              if (!isAuth && !newFbUser) { // log in
                ///NEED TO VERIFY FB TOKEN MATCHES DB USER
                graph.get('me', {
                  access_token: fbAccessToken
                }, function(err, data) {
                  if (err) {
                    res.status(400).json({
                      success: false,
                      error: err.message
                    });
                  } else {
                    if (data.id === user.facebook.id) { //makes sure request token fbId is equal to db fbId
                      req.body.newData = {};
                      user = user.toObject(); //convert to object
                      req.body.newData.user = user;
                      req.body.newData.message = 'facebook login success'; //set response message for jwt middleware
                      next();
                    } else {
                      res.status(400).json({
                        success: false,
                        error: 'facebook token error'
                      });
                    }
                  }
                });
              }
            }
          });
        });
      }
    });
  }
};

exports.gLogin = function(req, res, next) {
  var oauth2Client = new OAuth2(config.googleAuth.clientID, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
  if (!req.body.accessToken) {
    res.status(400).json({
      success: false,
      error: 'your request is missing information'
    });
  } else {
    var gAccessToken = req.body.accessToken;
    oauth2Client.getToken(gAccessToken, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if(err) {
        console.log(err);
        res.status(400).json({
          success: false,
          error: err.message
        });
      } else {
        
        oauth2Client.setCredentials(tokens);

        plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
          if (err) {
            res.status(400).json({
              success: false,
              error: err.message
            });
          }
        var isAuth,
            newGoogUser,
            googInfo,
            googId = profile.id,
            googToken = tokens.access_token,
            googEmail = profile.emails[0].value;
        //CHECK IF USER IS AUTHENTICATED via JWT
        checkJwt(req, function(err, data) {
          if (err) { //Not Authenticated 
            isAuth = false; //user is not logged in
          } else {
            var userEmail = data.email; //logged in user email
            isAuth = true; //user is logged in
          }
          var googQuery = {
            'google.id': googId
          };
          //CHECK IF Request Google Id is in Database
          User.findOne(googQuery, function(err, user) {
            if (err) {} else {
              if (user === null) { //Google id is not in DB
                newGoogUser = true;

              } else { //Google id is in DB
                newGoogUser = false;
              }
              if (isAuth && newGoogUser) { // add to logged-in account
                var currentUser = {
                  'local.email': userEmail
                };
                googInfo = {
                  'google.id': googId,
                  'google.token': googToken,
                  'google.email': googEmail,
                };

                User.findOneAndUpdate(currentUser, googInfo, function(err, user) {
                  if (err) {
                    res.status(400).json({
                      success: false,
                      error: 'unknown error, please try again'
                    });
                  } else {
                    req.body.newData = {};
                    user = user.toObject(); //convert to object
                    user.hasGoog = true;
                    req.body.newData.user = user;
                    req.body.newData.message = 'google connection success'; //set response message for jwt middleware
                    next();
                  }
                });
              }
              if (isAuth && !newGoogUser) { // error 'this Facebook account is already linked to a user'
                res.status(400).json({
                  success: false,
                  error: 'this google account is already linked to a user'
                });
              }
              if (!isAuth && newGoogUser) { // sign up - add to db
                googInfo = {
                  'google.id': googId,
                  'google.token': googToken,
                  'google.email': googEmail,
                  'local.email': googEmail
                };
                var newUser = new User(googInfo);
                newUser.save(function(err) {
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
                    newUser = newUser.toObject(); //convert to object
                    newUser.hasGoog = true;
                    req.body.newData.user = newUser;
                    req.body.newData.message = 'google signup success'; //set response message for jwt middleware
                    next();
                  }
                });
              }
              if (!isAuth && !newGoogUser) { // log in
                req.body.newData = {};
                user = user.toObject(); //convert to object
                req.body.newData.user = user;
                req.body.newData.message = 'google login success'; //set response message for jwt middleware
                next();
              }
            }
          });
        });
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

exports.addPassword = function(req, res, next) {
  //check if body has passwords
  if (!req.body.newPass) {
    res.status(400).json({
      success: false,
      error: 'please include password'
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

      if (!user) {
        res.status(400).json({
          success: false,
          error: 'unknown error'
        });
      } else {
        //if (bcrypt.compareSync(req.body.currentPass, user.local.password)) {
        var newHash = bcrypt.hashSync(req.body.newPass, bcrypt.genSaltSync(10));

        User.findOneAndUpdate(userEmailQuery, {
          'local.password': newHash
        }, function(err, doc) {
          if (err) throw err;

          //add new data to req for create JWT
          req.body.newData = {};
          user = user.toObject(); //convert to object
          user.hasPass = true;
          req.body.newData.user = user;
          req.body.newData.message = 'password added'; //set response message for jwt middleware
          next();
        });
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
  if (!user.local.password && !user.hasPass) {

    user.hasPass = false;
  } else {
    user.hasPass = true;
  }


  if (!user.hasFb && !user.facebook) {
    user.hasFb = false;
  } else {
    user.hasFb = true;
  }
  
  if (!user.hasGoog && !user.google) {
    user.hasGoog = false;
  } else {
    user.hasGoog = true;
  }

  delete user.local; //remove local prop
  delete user.facebook; //remove facebook prop
  delete user.google; //remove google prop
  delete user.__v; //remove versionKey prop


  console.log(user);
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