const parser = require('@babel/parser')
const traverse = require('@babel/traverse')
const lodash = require('lodash')

const parse = code => {
  return parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      'classProperties',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'optionalChaining',
      'decorators-legacy'
    ],
    allowAwaitOutsideFunction: true
  })
}

const winPath = path => {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path)
  if (isExtendedLengthPath) {
    return path
  }
  return path.replace(/\\/g, '/')
}
const isReactComponent = code => {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      'classProperties',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'nullishCoalescingOperator',
      'objectRestSpread',
      'optionalChaining',
      'decorators-legacy'
    ],
    allowAwaitOutsideFunction: true
  })
  let hasJSXElement = false
  traverse.default(ast, {
    JSXElement(path) {
      hasJSXElement = true
      path.stop()
    },
    JSXFragment(path) {
      hasJSXElement = true
      path.stop()
    }
  })
  return hasJSXElement
}

const lastSlash = str => {
  return str[str.length - 1] === '/' ? str : `${str}/`
}

const routeToChunkName = ({ route, cwd } = { route: {} }) => {
  return typeof route.component === 'string'
    ? route.component
        .replace(new RegExp(`^${lastSlash(winPath(cwd || '/'))}`), '')
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/^src__/, '')
        .replace(/\.\.__/g, '')
        // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
        // ref: https://github.com/umijs/umi/issues/4155
        .replace(/[[\]]/g, '')
        // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
        .replace(/^.umi-production__/, 't__')
        .replace(/^pages__/, 'p__')
        .replace(/^page__/, 'p__')
    : ''
}

module.exports = {
  parse,
  winPath,
  isReactComponent,
  routeToChunkName,
  lodash
}
