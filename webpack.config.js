const path = require('path');
const webpack = require('webpack');


module.exports = {
  entry: './src/js/main.js',
  output: {
    path: path.resolve(__dirname, 'web'),
    filename: 'js/main.bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /(node_modules)/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } }}
    ]
  },
  stats: {
    colors: true
  },
  mode: 'development',
  devtool: 'source-map'
};
