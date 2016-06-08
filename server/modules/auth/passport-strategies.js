const passport = require('passport');
const ExtractJwt  = require('passport-jwt').ExtractJwt;
const JwtStrategy  = require('passport-jwt').Strategy;
const LocalStrategy  = require('passport-local');

const User = require('mongoose').model('User');
const { secret } = require('../../config/secret.config');


// LOCAL STRATEGY ----------------------
const localOptions = {
  usernameField: 'email',
  passReqToCallback: true,
  session: false,
};

const localLogin = new LocalStrategy(localOptions, (req, email, password, done) => {
  const errorObj = {
    message: 'incorrect email or password',
    status: 422,
  };
  
  User.findOne({ 'local.email': email, }, (err, user) => {
    if(err) return done(err);
    if(!user) return done(errorObj, false);
    
    user.comparePassword(password, (err, isMatch) => {
      if(err) return done(err);
      
      if(!isMatch) return done(errorObj, false);
      return done(null, user);
    });
    
  });
});

// JWT STRATEGY ----------------------
const tokenExtractor = (req) => {
  if (req && req.body) {
    return req.body.token || req.query.token || req.headers[''];
  }
  return null;
};

//Options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: tokenExtractor,
  tokenBodyField: 'token',
  tokenQueryParameterName: 'token',
  secretOrKey: secret,
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload._id, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin);
