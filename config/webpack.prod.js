const { merge } = require('webpack-merge')
const glob = require('glob')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const PurgeCSSPlugin = require('purgecss-webpack-plugin')
const common = require('./webpack.common.js')
const { SRC_PATH, SHOULD_OPEN_ANALYZER } = require('./constants')

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
    new PurgeCSSPlugin({
      paths: glob.sync(`${SRC_PATH}/**/*.{tsx,scss,less,css}`, { nodir: true }),
      whitelist: ['html', 'body']
    }),
    SHOULD_OPEN_ANALYZER &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: 8888
      })
  ],
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
