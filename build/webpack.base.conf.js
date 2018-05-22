const webpack = require('webpack')
const path = require('path')
const config = require('../config')
const utils = require('./utils')
const vueLoaderConfig = require('./vue-loader.conf')
const projectRoot = path.resolve(__dirname, '../')
var merge = require('webpack-merge')

const env = process.env.NODE_ENV
// check env & config/index.js to decide weither to enable CSS Sourcemaps for the
// various preprocessor loaders added to vue-loader at the end of this file
const cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap)
const cssSourceMapProd = (env === 'production' && config.build.productionSourceMap)
const useCssSourceMap = cssSourceMapDev || cssSourceMapProd

module.exports = function({platform, provider, server, pathVersion, versionUri, measure, builder}) {
  let basePack = {
    entry: {
      app: './src/main.js'
    },
    output: {
      path: config.build.assetsRoot,
      filename: '[name].js',
      publicPath: process.env.NODE_ENV === 'production' ?
        config.build.assetsPublicPath :
        config.dev.assetsPublicPath
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      modules: [path.join(__dirname, '../node_modules')],
      alias: {
        'vue$': 'vue/dist/vue.common.js',
        'hal': path.resolve(__dirname, `../src/hal/${platform.name}.js`),
        'helpers': path.resolve(__dirname, '../src/helpers'),
        'animations': path.resolve(__dirname, `../src/helpers/animations/${platform.animations}.js`),
        'servers': path.resolve(__dirname, `../config/servers/${server}.js`),
        'config': path.resolve(__dirname, `../config/index.js`),
        'src': path.resolve(__dirname, '../src'),
        'assets': path.resolve(__dirname, `../static/${provider}`),
        'cssassets': path.resolve(__dirname, `../../../static/${provider}`),
        'components': path.resolve(__dirname, '../src/components'),
        'sections': path.resolve(__dirname, '../src/containers/sections'),
        'mixins': path.resolve(__dirname, '../src/containers/mixins'),
        'containers': path.resolve(__dirname, '../src/containers'),
        'settings': path.resolve(__dirname, `../src/containers/sections/Settings/data/${platform.name}.js`),
        'version': path.resolve(__dirname, '../version.json'),
        'store': path.resolve(__dirname, `../src/vuex/store.js`),
        'src': path.resolve(__dirname, `../src`)
      }
    },
    resolveLoader: {
      modules: [path.join(__dirname, '../node_modules')]
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(js|vue)(\?.*)?$/,
          loader: 'eslint-loader',
          include: projectRoot,
          exclude: /node_modules/,
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoaderConfig(platform, provider)
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: projectRoot,
          exclude: /node_modules/,
          options: platform.babel
        },
        {
          test: /\.svg$/,
          loader: 'raw-loader'
        },
        {
          test: /\.(png|jpe?g|gif|mp4)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: `[path][name].[hash:7].[ext]`,
            // outputPath: `/portal/${provider}/${platform.name}/${pathVersion}/`
            publicPath: url => {
              console.log(`public path: ${url}`)
              return url
            }
          },
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: `[path][name].[hash:7].[ext]`,
            // publicPath: `../`
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'measurePerf' : JSON.stringify(measure || false),
        'versionUri': JSON.stringify(versionUri),
        'builder': JSON.stringify(builder)
      }),
      // Webpack 3 Scope Hoisting
      new webpack.optimize.ModuleConcatenationPlugin()
    ]
  }
  if (platform.name === 'lg') {
    basePack = merge({
      entry: {
        webOS: './src/lib/webOS.js'
      },
      output: {
        path: `${config.build.assetsRoot}/portal/${provider}/${platform.name}/${pathVersion}`,
        //filename: utils.assetsPath(`portal/${provider}/${platform.name}/${pathVersion}/js/[name].js`),
        //chunkFilename: utils.assetsPath(`portal/${provider}${platform.name}/${pathVersion}/js/[id].js`)
        filename: utils.assetsPath(`js/[name].js`),
        chunkFilename: utils.assetsPath(`js/[id].js`)
      },
      resolve: {
        alias: {
          'webos': path.resolve(__dirname, '../src/lib/webOS.js')
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          'webos': 'webos'
        })
      ]
    }, basePack)
  }
  return basePack
}
