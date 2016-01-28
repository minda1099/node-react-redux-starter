
module.exports = {
  entry: ['./app/app.js'],
  output: {
        path: __dirname + "/public/js",
        filename: "bundle.js"
  },
  module: {
    loaders: [{
      exclude: [/bower_components/, /node_modules/, /server/, /public/],
      loader: 'babel'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};