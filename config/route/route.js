/* eslint-disable import/no-unresolved */
/* eslint-disable unicorn/no-reduce */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const path = require('path')
const lodash = require('lodash')
const getConventionalRoutes = require('./getConventionalRoutes')
const { winPath } = require('./utils')
const { routersToJson } = require('./routesToJSON')

const { join } = path

class Route {
  constructor(opts) {
    this.opts = opts || {}
  }

  async getRoutes(opts) {
    const { config, root, componentPrefix } = opts
    // 避免修改配置里的 routes，导致重复 patch
    let routes = lodash.cloneDeep(config.routes)
    let isConventional = false
    if (!routes) {
      // assert(root, `opts.root must be supplied for conventional routes.`)
      routes = this.getConventionRoutes({
        root,
        config,
        componentPrefix
      })
      isConventional = true
    }
    await this.patchRoutes(routes, {
      ...opts,
      isConventional
    })
    return routes
  }

  async patchRoutes(routes, opts) {
    if (this.opts.onPatchRoutesBefore) {
      await this.opts.onPatchRoutesBefore({
        routes,
        parentRoute: opts.parentRoute
      })
    }
    for (const route of routes) {
      await this.patchRoute(route, opts)
    }
    if (this.opts.onPatchRoutes) {
      await this.opts.onPatchRoutes({
        routes,
        parentRoute: opts.parentRoute
      })
    }
  }

  async patchRoute(route, opts) {
    if (this.opts.onPatchRouteBefore) {
      await this.opts.onPatchRouteBefore({
        route,
        parentRoute: opts.parentRoute
      })
    }

    // route.path 的修改需要在子路由 patch 之前做
    if (route.path && route.path.charAt(0) !== '/' && !/^https?:\/\//.test(route.path)) {
      route.path = winPath(join(opts.parentRoute.path || '/', route.path))
    }
    if (route.redirect && route.redirect.charAt(0) !== '/') {
      route.redirect = winPath(join(opts.parentRoute.path || '/', route.redirect))
    }

    if (route.routes) {
      await this.patchRoutes(route.routes, {
        ...opts,
        parentRoute: route
      })
    } else if (!('exact' in route)) {
      // exact by default
      route.exact = true
    }

    // resolve component path
    if (
      route.component &&
      !opts.isConventional &&
      typeof route.component === 'string' &&
      !route.component.startsWith('@/') &&
      !path.isAbsolute(route.component)
    ) {
      route.component = winPath(join(opts.root, route.component))
    }

    // resolve wrappers path
    if (route.wrappers) {
      route.wrappers = route.wrappers.map(wrapper => {
        if (wrapper.startsWith('@/') || path.isAbsolute(wrapper)) {
          return wrapper
        }
        return winPath(join(opts.root, wrapper))
      })
    }

    if (this.opts.onPatchRoute) {
      await this.opts.onPatchRoute({
        route,
        parentRoute: opts.parentRoute
      })
    }
  }

  getConventionRoutes(opts) {
    return getConventionalRoutes(opts)
  }

  getJSON(opts) {
    return routersToJson(opts)
  }

  getPaths({ routes = [] }) {
    return lodash.uniq(
      routes.reduce((memo, route) => {
        if (route.path) memo.push(route.path)
        if (route.routes) memo = memo.concat(this.getPaths({ routes: route.routes }))
        return memo
      }, [])
    )
  }
}

module.exports = Route
