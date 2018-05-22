const fs = require('fs')
const privateConfigPath = './config/private.json'
const privateWrapperConfigPath = './config/wrapper.conf.json'
const privateWrapperProdConfigPath = './config/wrapper.prodConf.json'

const copyConfig = (configPath) => {
  if (!fs.existsSync(configPath)) {
    const defaultConfig = fs.readFileSync(configPath + '.sample', 'utf-8')
    fs.writeFileSync(configPath, defaultConfig)
    console.log('Private config generated. 🐈')
  }
}

copyConfig(privateConfigPath)
copyConfig(privateWrapperConfigPath)
copyConfig(privateWrapperProdConfigPath)
