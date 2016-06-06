'use strict';

const auth = require('./auth.controller');

module.exports = (express, app) => {

  const apiAuthRoutes = express.Router();

  apiAuthRoutes.route('/register').post(auth.register, auth.createJwt); //{email, password} > token

  apiAuthRoutes.route('/login').post(auth.login, auth.createJwt); //{email, password} > token

  apiAuthRoutes.route('/facebook').post(auth.fbLogin, auth.createJwt); //{name, id, acessToken} > token

  apiAuthRoutes.route('/google').post(auth.gLogin, auth.createJwt); //{name, id, acessToken} > token

  apiAuthRoutes.route('/update-email').put(auth.requireAuth, auth.updateEmail, auth.createJwt); //{token, password, newEmail} > new Token

  apiAuthRoutes.route('/update-pass').put(auth.requireAuth, auth.updatePassword, auth.createJwt); //{token, oldPassword, newPassword} > sucess

  apiAuthRoutes.route('/add-pass').put(auth.requireAuth, auth.addPassword, auth.createJwt); //{token, newPassword} > sucess

  app.use('/api/auth/', apiAuthRoutes);

};