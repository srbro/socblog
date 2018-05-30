require('shelljs/global')
const fs = require('fs');
const log = console.log

const samsung = {
  wrap: function ({ cfg, projectPath }) {

    let response = {
      outputPath: '',
      outputFileName: '',
      status: 1
    }

    let outputPath = `${projectPath}/output`
    let wrapCmd = `${cfg.tizenSdkLocation}/tizen package -t wgt -s ${cfg.certificate} -o ${outputPath} -- ${projectPath}`

    response.status = exec(wrapCmd).code

    if (response.status === 0) {
      let outputFileName = ls(`${outputPath}`)

      if (outputFileName) {
        response.outputPath = outputPath
        response.outputFileName = outputFileName.toString()
      }

      log(`Wrap outputPath: ${outputPath}`)
      log(`Wrap outputFileName: ${outputFileName}`)
    }

    return response
  }
}

const lg = {
  wrap: function ({ cfg, projectPath }) {

    let response = {
      outputPath: '',
      outputFileName: '',
      status: 1
    }

    let outputPath = `${projectPath}/output`
    let wrapCmd = `${cfg.aresSdkLocation}/ares-package -o ${outputPath} ${projectPath}`
    response.status = exec(wrapCmd).code

    if (response.status === 0) {
      let outputFileName = ls(`${outputPath}`)

      if (outputFileName) {
        response.outputPath = outputPath
        response.outputFileName = outputFileName.toString()
      }

      log(`Wrap outputPath: ${outputPath}`)
      log(`Wrap outputFileName: ${outputFileName}`)
    }

    return response
  },
  changeServer: function(ip, folder) {
    folder = folder + '/redirect.js'
    var array = fs.readFileSync(folder).toString().split("\n");
    for (let i in array) {
      if (array[i].indexOf('var url = "') > -1) {
        array[i] = 'var url = "' + ip + '?";'
      }
    }
    array = array.join("\r\n")
    fs.writeFileSync(folder, array, 'utf8')
    log('Complete writing to file: ' + folder)
  }
}

const androidtv = {
  wrap: function ({ cfg, projectPath }) {

    let response = {
      outputPath: '',
      outputFileName: '',
      status: 1
    }

    let wrapCmd = `export ANDROID_HOME=${cfg.androidSdkLocation}; ${projectPath}/gradlew assembleTvDebug --stacktrace -p ${projectPath}`
    log('wrapCmd: ', wrapCmd)
    response.status = exec(wrapCmd).code

    let outputPath = `${projectPath}/app/build/outputs/apk/tv/debug`
    if (response.status === 0) {
      let outputFileName = ls(`${outputPath}`)

      if (outputFileName) {
        response.outputPath = outputPath
        //response.outputFileName = outputFileName.toString()
        response.outputFileName = `app-tv-debug.apk`
      }

      log(`Wrap outputPath: ${outputPath}`)
      log(`Wrap outputFileName: ${outputFileName}`)
    }

    return response
  }
}

const stb = {
  wrap: function ({ cfg, projectPath }) {

    let response = {
      outputPath: '',
      outputFileName: '',
      status: 1
    }

    let wrapCmd = `export ANDROID_HOME=${cfg.androidSdkLocation}; ${projectPath}/gradlew assembleStbDebug --stacktrace -p ${projectPath}`
    log('wrapCmd: ', wrapCmd)
    response.status = exec(wrapCmd).code

    let outputPath = `${projectPath}/app/build/outputs/apk/stb/debug`
    if (response.status === 0) {
      let outputFileName = ls(`${outputPath}`)

      if (outputFileName) {
        response.outputPath = outputPath
        //response.outputFileName = outputFileName.toString()
        response.outputFileName = `app-stb-debug.apk`
      }

      log(`Wrap outputPath: ${outputPath}`)
      log(`Wrap outputFileName: ${outputFileName}`)
    }

    return response
  }
}

module.exports = {
  samsung,
  lg,
  androidtv,
  stb
}
