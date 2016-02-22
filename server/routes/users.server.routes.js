'use strict';

var users = require('../controllers/users.server.controller');

module.exports = function(express, app, config) {

    var apiAuthRoutes = express.Router(); 

    apiAuthRoutes.route('/register').post(users.register); //{email, password} > token

    apiAuthRoutes.route('/login').post(users.login); //{email, password} > token

    apiAuthRoutes.route('/update-email').put(users.requireLogin, users.updateEmail); //{token, password, newEmail} > new Token

    apiAuthRoutes.route('/update-pass').put(users.requireLogin, users.updatePassword); //{token, oldPassword, newPassword} > sucess

    app.use('/api/auth/', apiAuthRoutes);


};