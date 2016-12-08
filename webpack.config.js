var path = require("path");
var CleanWebpackPlugin = require('clean-webpack-plugin');
var webpack = require('webpack');

const isProd = process.argv.findIndex((key) => key === '--prod') > -1;

console.log(isProd ? 'Production build' : 'Development build');

const plugins = [];

if (isProd) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      mangle: false
    }));

  plugins.unshift(
    new CleanWebpackPlugin(['build'], {
      root: path.resolve(__dirname, './'),
      verbose: true,
      dry: false
    }));
}

config = {
  entry: path.resolve(__dirname, './src/stepper.js'),
  output: {
    filename: 'stepper.js',
    path: path.resolve(__dirname, "build"),
    libraryTarget: 'umd',
    publicPath: '/build/'
  },
  stats: {
    colors: true,
    reasons: true,
    hash: false,
    modulesSort: 'name'
  },
  cache: true,
  module: {
    loaders: [{
        test: /\.js$/,
        cacheable: true,
        loader: 'babel',
        exclude: /(node_modules|core-js)/
      }]
  },
  resolveLoader: {
    root: path.resolve(__dirname, './')
  },
  plugins: plugins
};

if (!isProd) {
  config.devtool = 'source-map';
  config.debug = true;
}

module.exports = config;
