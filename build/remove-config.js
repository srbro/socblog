const fs = require('fs')
const privateWrapperConfigPath = './config/wrapper.conf.json'
const privateWrapperProdConfigPath = './config/wrapper.prodConf.json'

const removeConfig = (configPath) => {
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath)
    console.log('Private wrapper config removed. 🐈')
  }
}

removeConfig(privateWrapperConfigPath)
removeConfig(privateWrapperProdConfigPath)
