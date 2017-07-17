module.exports = {
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    stats: 'errors-only',
    contentBase: './static',
    host: '0.0.0.0',
    port: 8080
  }
};
