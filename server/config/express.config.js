'use strict';
// DEPENDENCIES
var logger          = require('morgan'); 
var bodyParser      = require('body-parser'); 
var path            = require('path');
var passport        = require('passport');
//var sass            = require('node-sass-middleware');
var compress        = require('compression');
var methodOverride  = require('method-override');
//var flash           = require('express-flash');


module.exports      = function(express, app, mongoose, config){
    
    app.disable('x-powered-by'); //basic security
    app.set('port', process.env.PORT || 8080);//Set port
    app.set('views', path.join(__dirname, '../../views'));//Set views directory
    app.engine('html', require('hogan-express'));//Set template engine
    app.set('view engine', 'html');//Set template engine
    app.use(compress());// compress all requests 
    app.use(express.static(path.join(__dirname, '../../public'), { maxAge: 31557600000 })); //Set static files/ public files directory
    app.use(logger('dev'));//log http requests to console


// app.use(sass({
    //   src: path.join(__dirname, 'public'),
    //   dest: path.join(__dirname, 'public'),
    //   sourceMap: true
    // }));
    
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(methodOverride());
    
   

};