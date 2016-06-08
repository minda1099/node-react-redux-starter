'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const graph = require('fbgraph');
graph.setVersion('2.4');

const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const plus = google.plus('v1');

const config = require('../../config/secret.config');
const secret = config.secret;

exports.register = (req, res, next) => {
  const { body, } = req;

  if (!body.email || !body.password) {
    next({
      message: 'missing email or password',
      status: 422,
    });
  } 

  const user = new User({
    'local.email': body.email,
    'local.password': body.password
  });
  user.save((err) => {
    if (err) {
      err.message = ((err) => {
        if (err.code === 11000) {
          return 'email is already in use, please try another';
        }
        return 'unknown error, please try again';
      })(err);
      next(err);
    }
    //add new data to req for create JWT
    req.body.newData = {};
    req.body.newData.user = user.toObject(); //convert to object
    req.body.newData.message = 'registration success'; //set response message for jwt middleware
    next();
  });
};

exports.login = (req, res, next) => {
  const { user } = req;
  //add new data to req for create JWT
  req.body.newData = {};
  req.body.newData.user = user.toObject(); //convert to object
  req.body.newData.message = 'login success'; //set response message for jwt middleware
  next();
};

exports.fbLogin = (req, res, next) => {
  if (!req.body.id || !req.body.accessToken) {
    next({
      message: 'your request is missing information',
      status: 422,
    });
  }

  const fbId = req.body.id;
  const fbEmail = req.body.email || null; //for users who don't allow email to be given

  //CHECK IF FACEBOOK ACCESS TOKEN IS AUTHENTIC 
  graph.extendAccessToken({
    'access_token': req.body.accessToken,
    'client_id': config.facebookAuth.clientID,
    'client_secret': config.facebookAuth.clientSecret
  }, (err, facebookRes) => {
    
    if (err) {//  NOT AUTHENTIC TOKEN
      next(err);
    }

    //IS AUTHENTIC
    const fbAccessToken = facebookRes.access_token; //Set token to refreshed token

    //CHECK IF USER IS AUTHENTICATED via JWT
    checkJwt(req, (err, data) => {
      const {
        isAuth, userEmail
      } = isAuthFn(err, data);

      const fbQuery = {
        'facebook.id': fbId
      };
      //CHECK IF Request Facebook Id is in Database
      User.findOne(fbQuery, (err, user) => {
        if (err) { //  NOT AUTHENTIC TOKEN
          next(err);
        }

        const newFbUser = ((user) => {
          if (user === null) { //FB id is not in DB
            return true;
          }
          return false;
        })(user);

        if (isAuth && newFbUser) { // add to logged-in account
          const currentUser = {
            'local.email': userEmail
          };

          const fbInfo = {
            'facebook.id': fbId,
            'facebook.token': fbAccessToken,
            'facebook.email': fbEmail,
          };

          User.findOneAndUpdate(currentUser, fbInfo, (err, user) => {
            if (err) {
              next(err);
            } else {
              req.body.newData = {};
              req.body.newData.user = user.toObject(); //convert to object
              req.body.newData.user.hasFb = true;
              req.body.newData.message = 'facebook connection success'; //set response message for jwt middleware
              next();
            }
          });
        }
        if (isAuth && !newFbUser) { // error 'this Facebook account is already linked to a user'
          next({
            message: 'this Facebook account is already linked to a user',
            status: 422,
          });
        }
        if (!isAuth && newFbUser) { // sign up - add to db
          const fbInfo = {
            'facebook.id': fbId,
            'facebook.token': fbAccessToken,
            'facebook.email': fbEmail,
            'local.email': fbEmail
          };
          const newUser = new User(fbInfo);
          newUser.save((err) => {
            if (err) {
              err.message = ((err) => {
                if (err.code === 11000) {
                  return 'email is already in use, please try another';
                }
                return 'unknown error, please try again';
              })(err);
              next(err);
            } else {
              //add new data to req for create JWT
              req.body.newData = {};
              req.body.newData.user = newUser.toObject(); //convert to object
              req.body.newData.user.hasFb = true;
              req.body.newData.message = 'facebook signup success'; //set response message for jwt middleware
              next();
            }
          });
        }
        if (!isAuth && !newFbUser) { // log in
          ///NEED TO VERIFY FB TOKEN MATCHES DB USER
          graph.get('me', {
            access_token: fbAccessToken
          }, (err, data) => {
            if (err) {
              next(err);
            } else {
              if (data.id === user.facebook.id) { //makes sure request token fbId is equal to db fbId
                req.body.newData = {};
                user = user.toObject(); //convert to object
                req.body.newData.user = user;
                req.body.newData.message = 'facebook login success'; //set response message for jwt middleware
                next();
              } else {
                next({
                  message: 'facebook token error',
                  status: 400,
                });
              }
            }
          });
        }
      });
    });
  });
};

exports.gLogin = (req, res, next) => {
  const oauth2Client = new OAuth2(config.googleAuth.clientID, config.googleAuth.clientSecret, config.googleAuth.redirectUri);
  if (!req.body.accessToken) {
    next({
      message: 'your request is missing information',
      status: 422,
    });
  }
  const gAccessToken = req.body.accessToken;
  oauth2Client.getToken(gAccessToken, (err, tokens) => {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (err) {
      next(err);
    }

    oauth2Client.setCredentials(tokens);

    plus.people.get({
      userId: 'me',
      auth: oauth2Client
    }, (err, profile) => {
      if (err) {
        next(err);
      }
      const googId = profile.id;
      const googToken = tokens.access_token;
      const googEmail = profile.emails[0].value;
      //CHECK IF USER IS AUTHENTICATED via JWT
      checkJwt(req, (err, data) => {

        const {
          isAuth, userEmail
        } = isAuthFn(err, data);

        const googQuery = {
          'google.id': googId
        };
        //CHECK IF Request Google Id is in Database
        User.findOne(googQuery, (err, user) => {
          if (err) {
            next(err);
          }
          const newGoogUser = ((user) => {
            if (user === null) { //Google id is not in DB
              return true;
            }
            return false;
          })(user);
          if (isAuth && newGoogUser) { // add to logged-in account
            const currentUser = {
              'local.email': userEmail
            };
            const googInfo = {
              'google.id': googId,
              'google.token': googToken,
              'google.email': googEmail,
            };

            User.findOneAndUpdate(currentUser, googInfo, (err, user) => {
              if (err) {
                next(err);
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
            next({
              message: 'this google account is already linked to a user',
              status: 422,
            });
          }
          if (!isAuth && newGoogUser) { // sign up - add to db
            const googInfo = {
              'google.id': googId,
              'google.token': googToken,
              'google.email': googEmail,
              'local.email': googEmail
            };
            const newUser = new User(googInfo);
            newUser.save((err) => {
              if (err) {
                err.message = ((err) => {
                  if (err.code === 11000) {
                    return 'email is already in use, please try another';
                  }
                  return 'unknown error, please try again';
                })(err);
                next(err);
              }
              //add new data to req for create JWT
              req.body.newData = {};
              req.body.newData.user = newUser.toObject(); //convert to object
              req.body.newData.user.hasGoog = true; //convert to object
              req.body.newData.message = 'google signup success'; //set response message for jwt middleware
              next();
            });
          }
          if (!isAuth && !newGoogUser) { // log in
            req.body.newData = {};
            req.body.newData.user = user.toObject(); //convert to object
            req.body.newData.message = 'google login success'; //set response message for jwt middleware
            next();
          }
        });
      });
    });
  });
};

exports.updateEmail = (req, res, next) => {
  const {
    body, user,
  } = req;
  if (!body.newEmail || !body.password) { //check if body has newEmail and password
    next({
      message: 'please include newEmail and password',
      status: 422,
    });
  }
  const userEmailQuery = {
    '_id': user._id,
  };
  const newEmailQuery = {
    'local.email': body.newEmail,
  };
  if (bcrypt.compareSync(body.password, user.local.password)) { // confirm password
    User.findOne(newEmailQuery, (err, user) => { // check if email is already in system
      if (err) {
        next(err);
      }
      if (!user) {
        User.findOneAndUpdate(userEmailQuery, newEmailQuery, (err, user) => { // update email in system
          if (err) {
            next(err);
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
        next({
          message: 'That email is already taken, please try another.',
          status: 422,
        });
      }
    });
  } else {
    next({
      message: 'incorrect password',
      status: 422,
    });
  }
};

exports.updatePassword = (req, res, next) => {
  const {
    body, user,
  } = req;
  //check if body has passwords
  if (!body.currentPass || !body.newPass) {
    next({
      message: 'include passwords',
      status: 400,
    });
  }
  const userIdQuery = {
    '_id': user._id
  };

  if (bcrypt.compareSync(body.currentPass, user.local.password)) {
    const newHash = bcrypt.hashSync(body.newPass, bcrypt.genSaltSync(10));

    User.findOneAndUpdate(userIdQuery, {
      'local.password': newHash
    }, (err, doc) => {
      if (err) return next(err);
      //add new data to req for create JWT
      req.body.newData = {};
      req.body.newData.user = user.toObject(); //convert to object
      req.body.newData.message = 'password updated'; //set response message for jwt middleware
      next();
    });

  } else {
    next({
      message: 'current password incorrect',
      status: 422,
    });
  }
};

exports.addPassword = (req, res, next) => {
  const {
    body, user,
  } = req;

  // check if user already has password
  if (user.local.password) {
    next({
      message: 'user already has password',
      status: 400,
    });
  }
  //check if body has passwords
  if (!body.newPass) {
    next({
      message: 'please include password',
      status: 400,
    });
  }
  const userQuery = {
    '_id': user._id
  };

  const newHash = bcrypt.hashSync(body.newPass, bcrypt.genSaltSync(10));

  User.findOneAndUpdate(userQuery, {
    'local.password': newHash
  }, (err, doc) => {
    if (err) {
      next(err);
    }
    //add new data to req for create JWT
    req.body.newData = {};
    req.body.newData.user = user.toObject(); //convert to object
    req.body.newData.user.hasPass = true;
    req.body.newData.message = 'password added'; //set response message for jwt middleware
    next();
  });
};

//middleware for create JWT response
exports.createJwt = (req, res, next) => {

  const {
    user
  } = req.body.newData;
  const message = ((req) => {
    if (req.body.newData.message) {
      return req.body.newData.message;
    }
    return null;
  })(req);
  const email = ((user) => {
    if (user.local && user.local.email) {
      return user.local.email;
    }
    return null;
  })(user);
  const hasPass = ((user) => {
    if (!user.local.password && !user.hasPass) {
      return false;
    }
    return true;
  })(user);
  const hasFb = ((user) => {
    if (!user.hasFb && !user.facebook) {
      return false;
    }
    return true;
  })(user);
  const hasGoog = ((user) => {
    if (!user.hasGoog && !user.google) {
      return false;
    }
    return true;
  })(user);

  delete user.local; //remove local prop
  delete user.facebook; //remove facebook prop
  delete user.google; //remove google prop
  delete user.__v; //remove versionKey prop

  user.email = email;
  user.hasPass = hasPass;
  user.hasFb = hasFb;
  user.hasGoog = hasGoog;

  //create jwt
  const token = jwt.sign(user, secret, {
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
  const token = req.body.token || req.query.token || req.headers['x-access-token'];
  // has token
  if (token) {
    // decodes,checks secret and experation
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        const error = 'failed to authenticate token';
        callback(error);
      } else {
        callback(null, decoded);
      }
    });

  } else {
    // handle no token
    const error = 'no token provided';
    callback(error);
  }
}

function isAuthFn(err, data) {
  if (err) { //Not Authenticated 
    return {
      isAuth: false,
      userEmail: null
    };
  }
  return {
    isAuth: true,
    userEmail: data.email
  }; //user is logged in
}