'use strict';
const path = require('path');

const webpack = require('webpack');
const webpackConfig = require('../../config/webpack.dev.config');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

module.exports = (express, app, mongoose, expressConfig) => {
  // SET STATIC FILES
  app.use(express.static(path.resolve('public'), {
    maxAge: 31557600000
  })); 
  // WEBPACK DEV SERVER SETTINGS
  if(!app.get('isProd') && !app.get('isTest')){
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
    
    // CATCH ALL ROUTING FOR HtmlWebpackPlugin
    app.use('*', function (req, res, next) {
      var filename = path.join(compiler.outputPath,'index.html');
      compiler.outputFileSystem.readFile(filename, function(err, result){
        if (err) {
          return next(err);
        }
        res.set('content-type','text/html');
        res.send(result);
        res.end();
      });
    });
  } else {
    // PROD CORE ROUTING
    require('./core.routes.js')(express, app, expressConfig);
  }
};