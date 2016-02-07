// dependencies
var express     = require('express');
var path        = require('path');
var logger      = require('morgan');
var bodyParser  = require('body-parser');
var path        = require('path');
var compress    = require('compression');
var config      = require('./config/config');

var app         = express();


app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));

app.engine('html', require("hogan-express"));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, '../public')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//server
var server = require('http').createServer(app);

//import routes
require('./routes/core.server.routes.js')(express, app, config);

// compress all requests 
app.use(compress())
//
server.listen(app.get('port'), function(){
    console.log("Running as on port: " + app.get('port'));
});
