var dev = require('./dev')

export default Object.assign(dev, {
  name: 'legacy',
  infoServerBaseUrl: 'https://api-legacy.ug.cdn.united.cloud',
  apiVersion: 'v1',
  // imageServerUrl: 'https://images.ug.cdn.united.cloud',
  imageServerUrl: 'https://images-legacy.ug.cdn.united.cloud',
  staticServer: 'https://static-legacy.ug.cdn.united.cloud'
})
