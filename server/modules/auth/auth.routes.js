'use strict';

const auth = require('./auth.controller');
const passport = require('passport');

require('./passport-strategies');
const requireAuth = passport.authenticate('jwt', { session: false, });
const requireLogin = passport.authenticate('local', { session: false, failWithError: true, });

module.exports = (express, app) => {

  const apiAuthRoutes = express.Router();

  apiAuthRoutes.route('/register').post(auth.register, auth.createJwt); //{email, password} > token

  apiAuthRoutes.route('/login').post(requireLogin, auth.login, auth.createJwt); //{email, password} > token

  apiAuthRoutes.route('/facebook').post(auth.fbLogin, auth.createJwt); //{name, id, acessToken} > token

  apiAuthRoutes.route('/google').post(auth.gLogin, auth.createJwt); //{name, id, acessToken} > token

  apiAuthRoutes.route('/update-email').put(requireAuth, auth.updateEmail, auth.createJwt); //{token, password, newEmail} > new Token

  apiAuthRoutes.route('/update-pass').put(requireAuth, auth.updatePassword, auth.createJwt); //{token, oldPassword, newPassword} > sucess

  apiAuthRoutes.route('/add-pass').put(requireAuth, auth.addPassword, auth.createJwt); //{token, newPassword} > sucess

  app.use('/api/auth/', apiAuthRoutes);

};