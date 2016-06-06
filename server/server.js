'use strict';
// DEPENDENCIES
const express = require('express');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');

//CREATE EXPRESS SERVER
const app = express();

//IMPORT SECRET ENV CONFIG SETTINGS
const config = require('./config/secret.config');
const utils = require('./utils.js');

//CONNNECT TO MongoDB
const connect = () => {
  mongoose.connect(config.db, (err, res) => {
    if (err) {
      console.log(`** Error connecting to: ${config.db}  ${err}`);
    } else {
      console.log('** MongoDB Connection Established');
      console.log(`** DB: ${config.db}`);
    }
  });
};
connect();
const db = mongoose.connection;
db.on('error', () => {
  process.exit(1);
});
db.on('disconnected', connect);

//IMPORT EXPRESS CONFIGURATION + INVOKE
require('./config/express.config')(express, app, mongoose, config);

//IMPORT CUSTOM MODULES
require('./modules')(express, app, mongoose, config, utils);

app.use(errorHandler()); //ERROR HANDLING

//RUN EXPRESS SERVER
app.listen(app.get('port'), () => {
  console.log('** SERVER RUNNING 😊');
  console.log(`** PORT:  ${app.get('port')}`);
  console.log(`** ENV:   ${process.env.NODE_ENV}`);
});