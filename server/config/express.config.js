'use strict';
// DEPENDENCIES
const logger = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');

module.exports = (express, app, mongoose, config) => {

  app.disable('x-powered-by'); //basic security
  app.set('port', process.env.PORT); //Set port

  app.use(compress()); // compress all requests 
  app.use(logger('dev')); //log http requests to console
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(methodOverride());

};