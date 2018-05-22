// This is the webpack config used for unit tests.

const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const config = require('../config')
const baseConfig = require('./webpack.base.conf')
const platform = require('../config/platforms')[config.defaultPlatform]
const provider = config.defaultProvider
const server = config.defaultServer
const buildVersion = config.defaultBuildVersion

const webpackConfig = merge(baseConfig({platform, provider, server, buildVersion}), {
  // use inline sourcemap for karma-sourcemap-loader
  module: {
    rules: utils.styleLoaders({ provider })
  },
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/test.env')
    })
  ]
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
