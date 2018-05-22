var utils = require('./utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = function(platform, provider) {
  return {
    loaders: utils.cssLoaders({
      sourceMap: isProduction
        ? config.build.productionSourceMap
        : config.dev.cssSourceMap,
      extract: isProduction,
      provider
    }),
    postcss: [
      require('autoprefixer')(platform.autoprefixer)
    ]
  }
}
