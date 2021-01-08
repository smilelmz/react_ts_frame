/* eslint-disable no-restricted-syntax */
/* eslint-disable unicorn/no-reduce */
/* eslint-disable no-param-reassign */
/* eslint-disable unicorn/import-style */
/* eslint-disable no-underscore-dangle */
const { existsSync, readdirSync, readFileSync, statSync } = require('fs')
const { basename, extname, join, relative } = require('path')
const { winPath, isReactComponent } = require('./utils')

// 考虑多种情况：
// 可能是目录，没有后缀，比如 [post]/add.tsx
// 可能是文件，有后缀，比如 [id].tsx
// [id$] 是可选动态路由
const RE_DYNAMIC_ROUTE = /^\[(.+?)]/

const getFile = opts => {
  const extsMap = {
    javascript: ['.ts', '.tsx', '.js', '.jsx'],
    css: ['.less', '.sass', '.scss', '.stylus', '.css']
  }
  const exts = extsMap[opts.type]
  for (const ext of exts) {
    const filename = `${opts.fileNameWithoutExt}${ext}`
    const path = winPath(join(opts.base, filename))
    if (existsSync(path)) {
      return {
        path,
        filename
      }
    }
  }
  return null
}

const getFiles = root => {
  if (!existsSync(root)) return []
  const excludeDir = new Set(['components', 'component', 'utils', 'util'])
  return readdirSync(root).filter(file => {
    const absFile = join(root, file)
    const fileStat = statSync(absFile)
    const isDirectory = fileStat.isDirectory()
    const isFile = fileStat.isFile()
    if (isDirectory && excludeDir.has(file)) {
      return false
    }
    if (file.charAt(0) === '.' || file.charAt(0) === '_') return false
    if (/\.(test|spec|e2e)\.(j|t)sx?$/.test(file)) return false
    if (/\.d\.ts$/.test(file)) return false
    if (isFile) {
      if (!/\.(j|t)sx?$/.test(file)) return false
      const content = readFileSync(absFile, 'utf-8')
      try {
        if (!isReactComponent(content)) return false
      } catch (error) {
        throw new Error(`Parse conventional route component ${absFile} failed, ${error.message}`)
      }
    }
    return true
  })
}

const normalizeRoute = (route, opts) => {
  let props
  if (route.component) {
    try {
      props = {}
      // props = getExportProps(readFileSync(route.component, 'utf-8'))
    } catch (error) {
      throw new Error(`Parse conventional route component ${route.component} failed, ${error.message}`)
    }
    route.component = winPath(relative(join(opts.root, '..'), route.component))
    route.component = `${opts.componentPrefix || '@/'}${route.component}`
  }
  return {
    ...route,
    ...(typeof props === 'object' ? props : {})
  }
}

const normalizePath = path => {
  path = winPath(path)
    .split('/')
    .map(p => {
      p = p.replace(RE_DYNAMIC_ROUTE, ':$1')
      if (p.endsWith('$')) {
        p = `${p.slice(0, -1)}?`
      }
      return p
    })
    .join('/')
  path = `/${path}`
  if (path === '/index/index') {
    path = '/'
  }
  path = path.replace(/\/index$/, '/')
  if (path !== '/' && path.slice(-1) === '/') {
    path = path.slice(0, -1)
  }
  return path
}

const normalizeRoutes = routes => {
  const paramsRoutes = []
  const exactRoutes = []
  const layoutRoutes = []

  routes.forEach(route => {
    const { __isDynamic, exact } = route
    delete route.__isDynamic
    if (__isDynamic) {
      paramsRoutes.push(route)
    } else if (exact) {
      exactRoutes.push(route)
    } else {
      layoutRoutes.push(route)
    }
  })

  return [...exactRoutes, ...layoutRoutes, ...paramsRoutes].reduce((memo, route) => {
    if (route.__toMerge && route.routes) {
      memo = memo.concat(route.routes)
    } else {
      memo.push(route)
    }
    return memo
  }, [])
}

const getRoutes = opts => {
  const { root, relDir = '', config } = opts
  const files = getFiles(join(root, relDir))
  const routes = normalizeRoutes(files.reduce(fileToRouteReducer.bind(null, opts), []))

  if (!relDir) {
    const globalLayoutFile = getFile({
      base: root,
      fileNameWithoutExt: `../${config.singular ? 'layout' : 'layouts'}/index`,
      type: 'javascript'
    })
    if (globalLayoutFile) {
      return [
        normalizeRoute(
          {
            path: '/',
            component: globalLayoutFile.path,
            routes
          },
          opts
        )
      ]
    }
  }

  return routes
}

const fileToRouteReducer = (opts, memo, file) => {
  const { root, relDir = '' } = opts
  const absFile = join(root, relDir, file)
  const stats = statSync(absFile)
  const __isDynamic = RE_DYNAMIC_ROUTE.test(file)
  if (stats.isDirectory()) {
    const relFile = join(relDir, file)
    const layoutFile = getFile({
      base: join(root, relFile),
      fileNameWithoutExt: '_layout',
      type: 'javascript'
    })
    const route = {
      path: normalizePath(relFile, opts),
      routes: getRoutes({
        ...opts,
        relDir: join(relFile)
      }),
      __isDynamic,
      ...(layoutFile
        ? {
            component: layoutFile.path
          }
        : {
            exact: true,
            __toMerge: true
          })
    }
    memo.push(normalizeRoute(route, opts))
  } else {
    const bName = basename(file, extname(file))
    memo.push(
      normalizeRoute(
        {
          path: normalizePath(join(relDir, bName), opts),
          exact: true,
          component: absFile,
          __isDynamic
        },
        opts
      )
    )
  }
  return memo
}

module.exports = getRoutes
