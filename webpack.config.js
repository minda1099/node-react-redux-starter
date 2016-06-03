const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack/hot/dev-server',
    './app/app.js',
  ],
  output: {
    path: path.join(__dirname, 'public/js/'),
    filename: "bundle.js",
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: [/bower_components/, /node_modules/, /server/, /public/],
      loader: 'babel',
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract(['css', 'sass']),
    }, {
      test: /\.(png|jpg|svg)$/,
      loader: 'file-loader',
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
};