'use strict';
const path = require('path');

const webpack = require('webpack');
const webpackConfig = require('../../config/webpack.dev.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

module.exports = (express, app, mongoose, expressConfig) => {
  if(process.env.NODE_ENV !== 'production'){
    const compiler = webpack(webpackConfig); 
  
    app.use(webpackDevMiddleware(compiler, {
        hot: true,
        historyApiFallback: true,
        publicPath: webpackConfig.output.publicPath,  
        stats: {colors: true},
    }));
  
    app.use(webpackHotMiddleware(compiler, {  
      log: console.log 
    }));
  }
  app.use(express.static(path.resolve('public'), {
    maxAge: 31557600000
  })); //Set static files/ public files direct
  app.set('views', path.resolve('public')); //Set views directory
  app.engine('html', require('hogan-express')); //Set template engine to hogan-express
  app.set('view engine', 'html'); //Set template engine

  require('./core.routes.js')(express, app, expressConfig); //core routes
};