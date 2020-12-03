const { merge } = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common.js')
const { HOST, PORT } = require('./constants')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    host: HOST,
    port: PORT,
    compress: true,
    open: true,
    hot: true
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
})
