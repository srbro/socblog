var dev = require('./dev')

export default Object.assign(dev, {
  name: 'prod',
  infoServerBaseUrl: 'https://api.ug.cdn.united.cloud',
  apiVersion: 'v1',
  // imageServerUrl: 'https://images.ug.cdn.united.cloud',
  imageServerUrl: 'https://images.ug.cdn.united.cloud',
  staticServer: 'https://static.ug.cdn.united.cloud'
})
