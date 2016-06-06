'use strict';

module.exports = (express, app, mongoose, config) => {

  require('./auth.models.js'); //auth models
  require('./auth.routes.js')(express, app, config); //auth routes

};