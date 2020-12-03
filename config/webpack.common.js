const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const WebpackBar = require('webpackbar')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { ROOT_PATH, SRC_PATH, isDev } = require('./constants')

const getHtmlPlugin = () => {
  return new HtmlWebpackPlugin({
    template: `${ROOT_PATH}/public/index.html`,
    filename: 'index.html',
    cache: false,
    minify: isDev
      ? false
      : {
          removeAttributeQuotes: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true
        }
  })
}

const getCssLoaders = importLoaders => [
  'style-loader',
  {
    loader: 'css-loader',
    options: {
      modules: false,
      sourceMap: isDev,
      importLoaders
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              grid: true,
              flexbox: 'no-2009'
            },
            stage: 3
          }),
          require('postcss-normalize')
        ]
      },
      sourceMap: isDev
    }
  }
]

module.exports = {
  entry: {
    app: `${SRC_PATH}/index.tsx`
  },
  output: {
    filename: `js/[name]${isDev ? '' : '.[hash:8]'}.js`,
    path: `${ROOT_PATH}/dist`
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': SRC_PATH
    }
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: getCssLoaders(1)
      },
      {
        test: /\.less$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'less-loader',
            options: {
              sourceMap: isDev
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev
            }
          }
        ]
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024,
              name: '[name].[contenthash:8].[ext]',
              outputPath: 'assets/images'
            }
          }
        ]
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[contenthash:8].[ext]',
              outputPath: 'assets/fonts'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    getHtmlPlugin(),
    new CopyPlugin({
      // 拷贝静态资源
      patterns: [
        {
          context: `${ROOT_PATH}/public`,
          from: '*',
          to: `${ROOT_PATH}/dist`,
          toType: 'dir'
        }
      ]
    }),
    new WebpackBar({
      name: isDev ? '正在启动' : '正在打包',
      color: '#008B00'
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: `${ROOT_PATH}/tsconfig.json`
      }
    })
  ],
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
