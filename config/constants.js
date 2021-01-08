const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'
const HOST = 'localhost'
const PORT = '7001'
const ROOT_PATH = path.resolve(__dirname, '..')
const SRC_PATH = `${ROOT_PATH}/src`
const PROJECT_NAME = path.parse(ROOT_PATH).name

// 是否开启 modules 缓存
const IS_OPEN_HARD_SOURCE = true

// 是否开启 bundle 包分析
const SHOULD_OPEN_ANALYZER = process.env.ANALYZER === 1

module.exports = {
  isDev,
  HOST,
  PORT,
  ROOT_PATH,
  SRC_PATH,
  PROJECT_NAME,
  IS_OPEN_HARD_SOURCE,
  SHOULD_OPEN_ANALYZER
}
