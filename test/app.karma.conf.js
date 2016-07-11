const webpack = require('webpack');
const path = require('path');

module.exports = (config) => {
  config.set({

    browsers: ['PhantomJS'],

    singleRun: !!process.env.CI,

    frameworks: ['mocha', 'jquery-chai'],

    files: [
      '../node_modules/phantomjs-polyfill/bind-polyfill.js',
      '../node_modules/es6-promise/dist/es6-promise.js',
      'app.glob.tests.js',
    ],

    preprocessors: {
      'app.glob.tests.js': ['webpack', 'sourcemap'],
    },

    reporters: ['mocha'],

    plugins: [
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-mocha-reporter'),
      require('karma-phantomjs-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-jquery-chai'),
    ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel'],
        }, {
          test: /\.scss$/,
          loaders: ['css', 'sass'],
        }, {
          test: /\.(png|jpg|svg)$/,
          loader: 'file-loader',
          exclude: /node_modules/,
        }],
      },
      resolve: {
        modulesDirectories: [
          'app',
          'node_modules',
        ],
        alias: {
          helpers: path.join(__dirname, '../test/helpers/'),
          app: path.join(__dirname, '../app/'),
        },
      },
      plugins: [
        new webpack.IgnorePlugin(/\.json$/),
        new webpack.DefinePlugin({
          __DEVTOOLS__: false,
        }),
      ],
    },
    webpackServer: {
      noInfo: true,
    },
  });
};
