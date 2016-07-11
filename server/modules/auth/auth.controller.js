'use strict';


const async = require('asyncawait/async');
const await = require('asyncawait/await');
const Promise = require('bluebird');

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


function verifyGoogleToken(accessToken) {  
  return new Promise((resolve, reject) => {
    
    const oauth2Client = new OAuth2(config.googleAuth.clientID, config.googleAuth.clientSecret, config.googleAuth.redirectUri);

    oauth2Client.getToken(accessToken, (err, tokens) => {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (err) {
        reject(err);
      }
      oauth2Client.setCredentials(tokens);
      resolve({ oauth2Client, tokens });
    });
  });
}

function getGoogleProfile(oauth2Client) {
  return new Promise((resolve, reject) => {
    plus.people.get({
      userId: 'me',
      auth: oauth2Client
    }, (err, profile) => {
      if (err) {
        reject(err);
      }
      resolve(profile);
    });
  });
}

function verifyFacebookToken(accessToken) {  
  return new Promise((resolve, reject) => {
    graph.extendAccessToken({
      'access_token': accessToken,
      'client_id': config.facebookAuth.clientID,
      'client_secret': config.facebookAuth.clientSecret
    },(err, facebookRes) => {
      if (err) {
        reject(err);
      }
      resolve(facebookRes);
    });
  });
}

function getFacebookProfile(accessToken) {
  return new Promise((resolve, reject) => {
    graph.get('me', {
      access_token: accessToken
    }, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

exports.register = (req, res, next) => {
  const { body } = req;

  if (!body.email || !body.password) {
    return next({
      message: 'missing email or password',
      status: 422,
    });
  } 

  const hash = bcrypt.hashSync(body.password, bcrypt.genSaltSync(10));

  const user = new User({
    'local.email': body.email.toLowerCase(),
    'local.password': hash,
  });
  user.save()
  .then(() => {
    req.body.newData = {};
    req.body.newData.user = user.toObject(); //convert to object
    req.body.newData.message = 'registration success'; //set response message for jwt middleware
    return next();
  })
  .catch(err => {
    err.message = ((err) => {
      if (err.code === 11000) {
        return 'email is already in use, please try another';
      }
      return 'unknown error, please try again';
    })(err);
    return next(err);
  });
};

exports.login = (req, res, next) => {
  const { body } = req;
  if (!body.email || !body.password) {
    return next({
      message: 'missing email or password',
      status: 422,
    });
  }

  (async(() => {
    try {
      const user = await (User.findOne({
        'local.email': body.email.toLowerCase(),
      }));
      if (!user) {
        return next({
          message: 'incorrect email or password',
          status: 422,
        });
      }
      if (bcrypt.compareSync(body.password, user.local.password)) {
        req.body.newData = {};
        req.body.newData.user = user.toObject(); //convert to object
        req.body.newData.message = 'login success'; //set response message for jwt middleware
        return next();
      } 
      return next({
        message: 'incorrect email or password',
        status: 422,
      });

    } catch (err) {
      return next(err);
    }
  }))();
};

exports.fbLogin = (req, res, next) => {
  const { body } = req;
  
  if (!body.id || !body.accessToken) {
    return next({
      message: 'your request is missing information',
      status: 422,
    });
  }
  
  const fbId = body.id;
  const fbEmail = body.email || null; // for fb users who don't allow email to be given
  const authUser = req.user;

  (async (() => {
    try {
      const { access_token } = await(verifyFacebookToken(body.accessToken));
      const userFB = await(User.findOne({'facebook.id': fbId}));
      if (authUser && !userFB) { // User is authd and facebook is not associated with an account.
        const currentUser = {
          'local.email': authUser.local.email
        };
        const fbInfo = {
          'facebook.id': fbId,
          'facebook.token': access_token,
          'facebook.email': fbEmail,
        };
        const user = await(User.findOneAndUpdate(currentUser, fbInfo));
        req.body.newData = {};
        req.body.newData.user = user.toObject(); //convert to object
        req.body.newData.user.hasFb = true;
        req.body.newData.message = 'facebook connection success'; //set response message for jwt middleware
        return next();
      }
      else if (!authUser && !userFB) { // User is not authd and facebook is not associated with an account..
        const fbInfo = {
          'facebook.id': fbId,
          'facebook.token': access_token,
          'facebook.email': fbEmail,
          'local.email': fbEmail
        };
        const newUser = await(new User(fbInfo));
        newUser.save()
        .then(() => {
          //add new data to req for create JWT
          req.body.newData = {};
          req.body.newData.user = newUser.toObject(); //convert to object
          req.body.newData.user.hasFb = true;
          req.body.newData.message = 'facebook signup success'; //set response message for jwt middleware
          return next();
        })
        .catch(err => {
          err.message = ((err) => {
            if (err.code === 11000) {
              return 'email is already in use, please try another';
            }
            return 'unknown error, please try again';
          })(err);
          return next(err);
        });
      }
     // FB id is in DB
      else if (authUser && userFB) { // User is authd and facebook is associated with an account.
        return next({
          message: 'this Facebook account is already linked to a user',
          status: 422,
        });
      } else {
        // NEED TO VERIFY FB TOKEN MATCHES DB USER
        const data = await(getFacebookProfile(access_token));
        if (data.id === userFB.facebook.id) { //makes sure request token fbId is equal to db fbId
          req.body.newData = {};
          req.body.newData.user = userFB.toObject(); //convert to object
          req.body.newData.message = 'facebook login success'; //set response message for jwt middleware
          return next();
        } 
        return next({
          message: 'facebook token error',
          status: 400,
        });
      }
    }
    catch(err) {
      return next(err);
    }
  }))();
};

exports.gLogin = (req, res, next) => {
  if (!req.body.accessToken) {
    return next({
      message: 'your request is missing information',
      status: 422,
    });
  }
  const accessToken = req.body.accessToken;
  
  (async (() => {
    try {
      const { oauth2Client, tokens } = await(verifyGoogleToken(accessToken));
      const profile = await(getGoogleProfile(oauth2Client));
          
      const googId = profile.id;
      const googToken = tokens.access_token;
      const googEmail = profile.emails[0].value;
      const authUser = req.user;
      const googQuery = {
        'google.id': googId
      };
        //CHECK IF Request Google Id is in Database
      const GoogUser = await (User.findOne(googQuery));
  
      if (authUser && !GoogUser) {// User is authd and google is not associated with an account.
        const currentUser = {
          'local.email': authUser.local.email
        };
        const googInfo = {
          'google.id': googId,
          'google.token': googToken,
          'google.email': googEmail,
        };

        const user = await(User.findOneAndUpdate(currentUser, googInfo));
        req.body.newData = {};
        req.body.newData.user =  user.toObject(); //convert to object
        req.body.newData.user.hasGoog =  true;
        req.body.newData.message = 'google connection success'; //set response message for jwt middleware
        return next();
      }
      if (authUser && GoogUser) { // User is authd and google is associated with an account.
        return next({
          message: 'this google account is already linked to a user',
          status: 422,
        });
      }
      if (!authUser && !GoogUser) { // User is not authd and google is not associated with an account.
        const googInfo = {
          'google.id': googId,
          'google.token': googToken,
          'google.email': googEmail,
          'local.email': googEmail
        };
        const newUser = await(new User(googInfo));
        newUser.save()
        .then(()=>{
          //add new data to req for create JWT
          req.body.newData = {};
          req.body.newData.user = newUser.toObject(); //convert to object
          req.body.newData.user.hasGoog = true; //convert to object
          req.body.newData.message = 'google signup success'; //set response message for jwt middleware
          return next();
        })
        .catch((err) => {
          err.message = ((err) => {
            if (err.code === 11000) {
              return 'email is already in use, please try another';
            }
            return 'unknown error, please try again';
          })(err);
          return next(err);
        });
      }
      if (!authUser && GoogUser) { // User is not authd and google is associated with an account.
        req.body.newData = {};
        req.body.newData.user = GoogUser.toObject(); //convert to object
        req.body.newData.message = 'google login success'; //set response message for jwt middleware
        return next();
      }
    }
    catch(err) {
      return next(err);
    }
  }))();

  
};

exports.updateEmail = (req, res, next) => {
  const { body, user } = req;
  if (!body.newEmail || !body.password) { //check if body has newEmail and password
    return next({
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
  (async (() => {
      try {
        if (bcrypt.compareSync(body.password, user.local.password)) { // confirm password
          const emailCheck =  await(User.findOne(newEmailQuery));
          if (!emailCheck) { // Email not in system
            const user =  await(User.findOneAndUpdate(userEmailQuery, newEmailQuery));
            req.body.newData = {};
            req.body.newData.user = user.toObject(); //add user to newData
            req.body.newData.user.local.email = req.body.newEmail; //make sure new email is set on user.email
            req.body.newData.message = 'email updated'; //set response message for jwt middleware
            return next();
          } 
          return next({
            message: 'That email is already taken, please try another.',
            status: 422,
          });
        }
        return next({
          message: 'incorrect password',
          status: 422,
        });
      }
      catch(err) {
        return next(err);
      }
    }))();
};

exports.updatePassword = (req, res, next) => {
  const { body, user } = req;
  //check if body has passwords
  if (!body.currentPass || !body.newPass) {
    return next({
      message: 'include passwords',
      status: 422,
    });
  }
  const userIdQuery = {
    '_id': user._id
  };
  (async (() => {
    try {
      if (bcrypt.compareSync(body.currentPass, user.local.password)) {
        const newHash = await(bcrypt.hashSync(body.newPass, bcrypt.genSaltSync(10)));
        const user = await(User.findOneAndUpdate(userIdQuery, { 'local.password': newHash }));
        req.body.newData = {};
        req.body.newData.user = user.toObject(); //convert to object
        req.body.newData.message = 'password updated'; //set response message for jwt middleware
        return next();
      } 
      return next({
        message: 'current password incorrect',
        status: 422,
      });
    }
    catch(err) {
      return next(err);
    }
  }))();
};

exports.addPassword = (req, res, next) => {
  const { body, user } = req;
  // check if user already has password
  if (user.local.password) {
    return next({
      message: 'user already has password',
      status: 400,
    });
  }
  //check if body has passwords
  if (!body.newPass) {
    return next({
      message: 'please include password',
      status: 400,
    });
  }
  
  const userQuery = {
    '_id': user._id
  };
  (async (() => {
    try {
      const newHash = await(bcrypt.hashSync(body.newPass, bcrypt.genSaltSync(10)));
      const user = await (User.findOneAndUpdate(userQuery, {
            'local.password': newHash
          }));
      req.body.newData = {};
      req.body.newData.user = user.toObject(); //convert to object
      req.body.newData.user.hasPass = true;
      req.body.newData.message = 'password added'; //set response message for jwt middleware
    return next();
    } catch(err) {
      return next(err);
    }
  }))();
};

// Middleware for creating JWT token response
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
  const output = {
    message: message,
    token: token,
    success: true,
  };
  res.status(200).json(output);
};

// Middleware for checking if request is from auth'd user
exports.jwtUserInfo = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token'];

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }
    User.findById(decoded._id)
    .then(user => {
      if (user) {
        req.user = user;
        return next();
      }
      req.user = null;
      return next();
    })
    .catch(err => {
      req.user = null;
      return next(err);
    });
  });
};

//middleware for checking if users if authenticated
exports.requireAuth = (req, res, next) => {
  const user = req.user;
  if(user) {
    return next();
  }
  return next({
    message: 'token required',
    status: 403,
  });
};