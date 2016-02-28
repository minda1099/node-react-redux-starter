'use strict';

var users = require('../controllers/users.server.controller');

module.exports = function(express, app, config) {

    var apiAuthRoutes = express.Router(); 

    apiAuthRoutes.route('/register').post(users.register, users.createJwt); //{email, password} > token

    apiAuthRoutes.route('/login').post(users.login, users.createJwt); //{email, password} > token

    apiAuthRoutes.route('/facebook').post(users.fbLogin, users.createJwt); //{name, id, acessToken} > token

    apiAuthRoutes.route('/update-email').put(users.requireAuth, users.updateEmail, users.createJwt); //{token, password, newEmail} > new Token

    apiAuthRoutes.route('/update-pass').put(users.requireAuth, users.updatePassword, users.createJwt); //{token, oldPassword, newPassword} > sucess

    apiAuthRoutes.route('/add-pass').put(users.requireAuth, users.updatePassword, users.createJwt); //{token, newPassword} > sucess

    app.use('/api/auth/', apiAuthRoutes);

};