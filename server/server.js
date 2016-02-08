// Dependencies
var express      = require('express');
var errorHandler = require('errorhandler');
var mongoose     = require('mongoose');

//Create Express server
var app          = express();

//Import ENV config variables
var config       = require('./config/env.config');


//Connect to database
mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running and that you have the correct db set in config');
  process.exit(1);
});
db.once('open', function() {
  console.log('**MongoDB Connection Established**');
});



//Express Configuration
require('./config/express.config')(express, app, mongoose);

//server
var server = require('http').createServer(app);

//import routes
require('./routes/core.server.routes.js')(express, app, config);


app.use(errorHandler());//error handling

server.listen(app.get('port'), function(){
    console.log('**Running as on port: ' + app.get('port') + '**');
});
