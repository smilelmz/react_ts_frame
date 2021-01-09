const Route = require('./route')

class RouteAutoGenerateWebpackPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.afterPlugins.tap('RouteAutoGenerateWebpackPlugin', () => {
      console.log(this.options)
    })
  }
}
module.exports = RouteAutoGenerateWebpackPlugin
