var dev = require('./dev')

export default Object.assign(dev, {
  name: 'stbenv',
  infoServerBaseUrl: 'https://api-stb.ug.cdn.united.cloud',
  apiVersion: 'v1',
  imageServerUrl: 'https://images-stb.ug.cdn.united.cloud',
  staticServer: 'https://static-stb.ug.cdn.united.cloud'
})
