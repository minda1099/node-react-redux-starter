'use strict';
// DEPENDENCIES
var express      = require('express');
var errorHandler = require('errorhandler');
var mongoose     = require('mongoose');


//CREATE EXPRESS SERVER
var app          = express();


//IMPORT SECRET ENV CONFIG SETTINGS
var config       = require('./config/secret.config');

//CONNNECT TO MongoDB

var connect = function() {
    mongoose.connect(config.db, function(err, res) {
        if(err) {
            console.log('** Error connecting to: ' + config.db + '. ' + err);
        }else {
            console.log('** MongoDB Connection Established');
            console.log('** DB: ' + config.db);

        }
    });
};
connect();
var db = mongoose.connection;
db.on('error',function() {
  process.exit(1);
});
db.on('disconnected', connect);


//IMPORT EXPRESS CONFIGERATION
require('./config/express.config')(express, app, mongoose, config);


//IMPORT ROUTES
require('./routes/core.server.routes.js')(express, app, config);


app.use(errorHandler());//Error handling

//RUN EXPRESS SERVER
app.listen(app.get('port'), function(){
    console.log('** Server Running 😊');
    console.log('** PORT: ' + app.get('port'));
    console.log('** ENV: ' + process.env.NODE_ENV);

});
