// see http://vuejs-templates.github.io/webpack for documentation.
var privateConfig = require('./private.json')
var path = require('path')

module.exports = {
  defaultProvider: 'uc',
  defaultPlatform: 'web',
  testServerIp: 'localhost',
  testServerPort: '3000',
  // infoServerTestUrl: 'http://192.168.49.39:8080/v1',
  // infoServerTestUrl: 'https://api0.ug.cdn.united.cloud/v1', // samsung submission march
  // imageServerUrl: 'http://images0.ug.cdn.united.cloud', // samsung submission march
  // infoServerTestUrl: 'http://192.168.49.39:8080/v1', // 39.49
  // imageServerUrl: 'http://192.168.49.39:8080', // 39 49
  // infoServerTestUrl: 'https://infoservice-stage.ug.cdn.united.cloud/v1', // dev
  apiVersion: 'v1',
  // infoServerBaseUrl: 'https://infoservice-stage.ug.cdn.united.cloud', //stage
  // imageServerUrl: 'https://images-stage.ug.cdn.united.cloud', // stage
  // infoServerBaseUrl: 'https://infoservice-qa.ug.cdn.united.cloud', //qa
  // imageServerUrl: 'https://images-qa.ug.cdn.united.cloud', // qa
  infoServerBaseUrl: 'https://api-stage.ug.cdn.united.cloud', //qa
  imageServerUrl: 'https://images-stage.ug.cdn.united.cloud', // qa
  infoServerQA: 'https://api-stage.ug.cdn.united.cloud/', // infoservice qa
  staticServerQA: 'https://static-stage.ug.cdn.united.cloud', // static qa
  //measurementServer: 'http://127.0.0.1:8086',
  measurement: {
    server: 'https://influxdb-frontend.united.cloud:8086',
    db: 'frontend_db',
    user: 'frontend',
    pass: '9tCvH927DmXfN3siwfceTtzeqcyiWhXG'
  },
  measurementLocal: {
    server: 'http://192.168.48.202:8086',
    db: 'eontv'
  },
  defaultServer: 'dev',
  defaultPathVersion: 'v1',
  defaultBuildVersion: 'build0',
  build: {
    env: require('./prod.env'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: '',
    assetsPublicPath: '',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css']
  },
  dev: {
    env: require('./dev.env'),
    port: privateConfig.devPort,
    assetsSubDirectory: '',
    assetsPublicPath: '',
    proxyTable: {},
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}
