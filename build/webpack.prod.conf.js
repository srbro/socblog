var path = require('path')
var config = require('../config')
var utils = require('./utils')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : config.build.env

module.exports = function({platform, provider, server, pathVersion, versionUri, measure, builder}) {
  var webpackConfig = merge(baseWebpackConfig({platform, provider, server, pathVersion, versionUri, measure, builder}), {
    module: {
      rules: utils.styleLoaders({
        sourceMap: config.build.productionSourceMap,
        extract: true,
        provider
      })
    },
    devtool: config.build.productionSourceMap ? '#source-map' : false,
    output: {
      //path: config.build.assetsRoot,
      path: `${config.build.assetsRoot}/portal/${provider}/${platform.name}/${pathVersion}`,
      //filename: utils.assetsPath(`portal/${provider}/${platform.name}/${pathVersion}/js/[name].js`),
      //chunkFilename: utils.assetsPath(`portal/${provider}${platform.name}/${pathVersion}/js/[id].js`)
      filename: utils.assetsPath(`js/[name].js`),
      chunkFilename: utils.assetsPath(`js/[id].js`)
    },
    plugins: [
      // http://vuejs.github.io/vue-loader/en/workflow/production.html
      new webpack.DefinePlugin({
        'process.env': env
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          drop_console: true
        },
        sourceMap: true
      }),
      // extract css into its own file
      new ExtractTextPlugin({
        filename: utils.assetsPath(`[name].css`)
      }),
      // generate dist index.html with correct asset hash for caching.
      // you can customize output by editing /index.html
      // see https://github.com/ampedandwired/html-webpack-plugin
      new HtmlWebpackPlugin({
        filename: process.env.NODE_ENV === 'testing'
          ? 'index.html'
          : `index.html`,
        template: `index-${platform.name}.html`,
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
          // more options:
          // https://github.com/kangax/html-minifier#options-quick-reference
        },
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin 'dependency',
        chunksSortMode: (a, b) => {
          if (a.names[0] === 'manifest') {
            return -1
          }
          if (b.names[0] === 'manifest') {
            return 1
          }
          if (a.names[0] === 'vendor') {
            return -1
          }
          if (b.names[0] === 'vendor') {
            return 1
          }
          if (a.names[0] === 'webOS') {
            return -1
          }
          if (b.names[0] === 'webOS') {
            return 1
          }
          return a.names[0] >= b.names[0] ? -1 : 1
        }
      }),
      // split vendor js into its own file
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        minChunks: function (module, count) {
          // any required modules inside node_modules are extracted to vendor
          return (
            module.resource &&
            /\.js$/.test(module.resource) &&
            module.resource.indexOf(
              path.join(__dirname, '../node_modules')
            ) === 0
          )
        }
      }),
      // extract webpack runtime and module manifest to its own file in order to
      // prevent vendor hash from being updated whenever app bundle is updated
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        chunks: ['vendor']
      })
    ]
  })

  if (config.build.productionGzip) {
    var CompressionWebpackPlugin = require('compression-webpack-plugin')

    webpackConfig.plugins.push(
      new CompressionWebpackPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: new RegExp(
          '\\.(' +
          config.build.productionGzipExtensions.join('|') +
          ')$'
        ),
        threshold: 10240,
        minRatio: 0.8
      })
    )
  }

  return webpackConfig
}
