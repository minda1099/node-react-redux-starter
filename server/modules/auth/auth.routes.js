'use strict';

const { register, login, fbLogin, gLogin, updateEmail, updatePassword, addPassword, createJwt, } = require('./auth.controller');
const passport = require('passport');

require('./passport-strategies');
const requireAuth = passport.authenticate('jwt', { session: false, });
const requireLogin = passport.authenticate('local', { session: false, failWithError: true, });

module.exports = (express, app) => {
  const apiAuthRoutes = express.Router();

  apiAuthRoutes.route('/register').post(register, createJwt); //{email, password} > token

  apiAuthRoutes.route('/login').post(requireLogin, login, createJwt); //{email, password} > token

  apiAuthRoutes.route('/facebook').post(fbLogin, createJwt); //{name, id, acessToken} > token

  apiAuthRoutes.route('/google').post(gLogin, createJwt); //{name, id, acessToken} > token

  apiAuthRoutes.route('/update-email').put(requireAuth, updateEmail, createJwt); //{token, password, newEmail} > new Token

  apiAuthRoutes.route('/update-pass').put(requireAuth, updatePassword, createJwt); //{token, oldPassword, newPassword} > sucess

  apiAuthRoutes.route('/add-pass').put(requireAuth, addPassword, createJwt); //{token, newPassword} > sucess

  app.use('/api/auth/', apiAuthRoutes);
};
