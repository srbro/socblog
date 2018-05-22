var dev = require('./dev')

export default Object.assign(dev, {
  name: 'stage',
  infoServerBaseUrl: 'https://infoservice-stage.ug.cdn.united.cloud',
  apiVersion: 'v1',
  imageServerUrl: 'https://images-stage.ug.cdn.united.cloud',
  staticServer: 'https://static-stage.ug.cdn.united.cloud'
})
