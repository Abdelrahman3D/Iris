const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dev = require('./webpack.config.dev.js');

const config = {
  devtool: '#cheap-module-eval-source-map',
  entry: {
    app: path.join(__dirname, '/../', 'src/main.js')
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    })
  ],
  output: {
    path: path.join(__dirname, '/../dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /.styl$/,
        loaders: ['style-loader', 'css-loader', 'stylus-loader']
      }
    ]
  }
};


module.exports = merge(config, dev);
