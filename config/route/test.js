const path = require('path')
const Route = require('./route')

const routes = new Route().getRoutes({
  root: path.resolve(__dirname, '../../', 'src/pages'),
  config: {}
})

console.log(routes)
const jsonStr = new Route().getJSON({
  routes,
  config: {},
  cwd: '/foo/bar/'
})

console.log(jsonStr)
