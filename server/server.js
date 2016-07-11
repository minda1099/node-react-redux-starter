if (+process.versions.node.split('.')[0] < 6) {
  const err = `NODE VERSION MUST BE GREATER THAN OR EQUAL TO 6. CURRENT VERSION: ${process.versions.node}`;
  throw new Error(err);
}

// DEPENDENCIES
const express = require('express');
const mongoose = require('mongoose');

// CREATE EXPRESS SERVER
const app = express();

function dbConnect(config) {
  return new Promise((resolve, reject) => {
    mongoose.connect(config.db)
    .then(() => {
      if (!app.get('isTest')) {
        console.log('** MongoDB Connection Established');
        console.log(`** DB: ${config.db}`);
      }
      resolve();
    })
    .catch(err => {
      console.log(`** Error connecting to: ${config.db}  ${err}`);
      reject();
    });
  });
}

// IMPORT SECRET ENV CONFIG SETTINGS
const config = require('./config/secret.config');
const utils = require('./utils.js');

// CONNNECT TO MongoDB
dbConnect(config);
const db = mongoose.connection;
db.on('error', () => {
  process.exit(1);
});


if (app.get('isProd')) {
  db.on('disconnected', dbConnect);
}

// IMPORT EXPRESS CONFIGURATION + INVOKE
require('./config/express.config')(express, app, mongoose, config);

// IMPORT CUSTOM MODULES
require('./modules')(express, app, mongoose, config, utils);

// Middleware error handler
app.use((err, req, res, next) => {
  if (!app.get('isTest')) console.error(err);
  const output = {
    name: err.name,
    message: err.message,
    text: err.toString(),
    success: false,
  };
  const statusCode = err.status || 500;

  res.status(statusCode).json(output);
});

// RUN EXPRESS SERVER
const server = app.listen(app.get('port'), () => {
  if (!app.get('isTest')) {
    console.log('** SERVER RUNNING 😊');
    console.log(`** PORT:  ${app.get('port')}`);
    console.log(`** ENV:   ${process.env.NODE_ENV}`);
  }
});

module.exports = { server, mongoose, db };
