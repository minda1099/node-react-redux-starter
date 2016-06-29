const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    './app/app.js',
  ],
  output: {
    path: path.resolve('public'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [/bower_components/, /node_modules/, /server/, /public/],
      loaders: ['babel'],
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract(['css', 'sass']),
    }, {
      test: /\.(png|jpg|svg)$/,
      loader: 'file-loader',
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production'),
      },
    }),
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      // favicon: './src/assets/favicon.png',
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
  ],
  resolve: {
    modulesDirectories: [
      'app',
      'node_modules',
    ],
    alias: {
      'helpers': path.join(__dirname, '../../tests/helpers/'),
      'app': path.join(__dirname, '../../app/'),
      'components': path.join(__dirname, '../../app/components/'),
    },
  },
};