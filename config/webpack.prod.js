const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: { pure_funcs: ['console.log'] }
        }
      }),
      new OptimizeCssAssetsPlugin()
    ].filter(Boolean),
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'initial',
          minSize: 5 * 1024,
          priority: 0,
          minChunks: 1
        },
        vendor: {
          name: 'vendor',
          test: /[/\\]node_modules[/\\]/,
          chunks: 'initial',
          priority: 10,
          minChunks: 1
        }
      }
    }
  }
})
