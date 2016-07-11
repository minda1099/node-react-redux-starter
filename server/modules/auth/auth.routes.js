'use strict';

const {
  register,
  login,
  fbLogin,
  gLogin,
  updateEmail,
  updatePassword,
  addPassword,
  createJwt,
  jwtUserInfo,
  requireAuth,
} = require('./auth.controller');

module.exports = (express, app) => {
  const apiAuthRoutes = express.Router();

  apiAuthRoutes.route('/register').post(register, createJwt); // {email, password} > token

  apiAuthRoutes.route('/login').post(login, createJwt); // {email, password} > token

  apiAuthRoutes.route('/facebook').post(jwtUserInfo, fbLogin, createJwt); // {Facebook acessToken, Facebook Id} > token

  apiAuthRoutes.route('/google').post(jwtUserInfo, gLogin, createJwt); // {Google acessToken} > token

  apiAuthRoutes.route('/update-email').put(jwtUserInfo, requireAuth, updateEmail, createJwt); // {token, password, newEmail} > new Token

  apiAuthRoutes.route('/update-pass').put(jwtUserInfo, requireAuth, updatePassword, createJwt); // {token, oldPassword, newPassword} > sucess

  apiAuthRoutes.route('/add-pass').put(jwtUserInfo, requireAuth, addPassword, createJwt); // {token, newPassword} > sucess

  app.use('/api/auth/', apiAuthRoutes);
};
