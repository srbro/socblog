var dev = require('./dev')

export default Object.assign(dev, {
  name: 'qa',
  infoServerBaseUrl: 'https://infoservice-qa.ug.cdn.united.cloud',
  apiVersion: 'v1',
  imageServerUrl: 'https://images-qa.ug.cdn.united.cloud',
  staticServerQA: 'https://static-qa.ug.cdn.united.cloud', // static qa
  staticServer: 'https://static-qa.ug.cdn.united.cloud'
})
