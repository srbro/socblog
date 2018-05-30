/* globals rm, exec */
require('shelljs/global')
let extract = require('extract-zip')
let zipper = require('./zipper.js')
let path = require('path')
let cfg = null
let log = console.log
let buildPlatform = process.platform

let serverEnv = {
  stage: 'https://static-stage.ug.cdn.united.cloud',
  prod: 'https://static.ug.cdn.united.cloud',
  qa: 'https://static-qa.ug.cdn.united.cloud'
}


let platform = ''

const cloneWrapper = function (targetLoc) {
  log('Wrap clone git to: ' + targetLoc)
  rm('-rf', targetLoc)
  return exec(`git clone -b ${cfg.branch} --single-branch ${cfg.repo} ${targetLoc}`).code
}

const clearWrapper = function(targetLoc) {
  try {
    rm('-rf', targetLoc)
  } catch (err) {
    log('Wrap clearing failed because of: ' + err)
  }
}

const zipWrapper = function(sourcePath, sourceName, destinationPath, destinationName) {
  return new Promise(function (resolve, reject) {
    zipper.zip({
      'sourcePath': sourcePath,
      'inZipName': sourceName,
      'destinationPath': destinationPath,
      'destinationName': destinationName,
    }, function(zipStats) {
         log('Wrap finished zipping')
         resolve(0)
    })
  })
}

let unzipPortal = async function (zipFilePath, targetWrapperDir) {
  log('Unzip to ' + targetWrapperDir)
  return new Promise(function (resolve, reject) {
    extract(zipFilePath, {dir: targetWrapperDir}, function (err) {
      if (err) {
        log('Wrap unzip portal error: ' + err)
        reject(err)
      } else {
        log('Wrap unzip successfully finished')
        resolve(0)
      }
    })
  })
}

const wrap = async function (localPlatform, portalZipFile, outputZipPath, outputZipName, staticServer, portalPath, productionBuild) {
  platform = localPlatform
  let maker = require('./wraphals.js')[platform]
  let wrapperPath = path.resolve(__dirname, `../dist/${platform}_wrapper/`)
  let config = require('../config/' + productionBuild + '.json')[buildPlatform]

    log('Production Build: ' + productionBuild)
    log('Build platform: ' + buildPlatform)
    log('Wrap Output zip path: ' + outputZipPath)
    log('Wrap Output zip name: ' + outputZipName)

  try {
    if (!config[platform]) throw ('Missing config for platform: ' + platform)
    cfg = config[platform]


    let targetPortalLoc = `${wrapperPath}/${cfg.portalInWrapper}`
    let status = 0

    log('Wrapping platform: ' + localPlatform)

    status = cloneWrapper(wrapperPath)

    if (status === 0 ) {
      rm('-rf', path.join(wrapperPath, '.git'))
      if (cfg.localPortal) {
        log('Local portal - Unzip called')
        status = await unzipPortal(portalZipFile, targetPortalLoc)
      } else {
        log('Unzip call skipped')
        let serverPath = `${serverEnv[staticServer]}${portalPath}`
        console.log('serverPath: ', serverPath)
        maker.changeServer(serverPath, wrapperPath)
      }
    }

    if (status === 0) {
      wrapStatus = maker.wrap({cfg, projectPath: wrapperPath})
    }

    if (wrapStatus.status === 0) {
        let sourceFile = `${wrapStatus.outputPath}/${wrapStatus.outputFileName}`
        log(`Zipping ${sourceFile}`)
        await zipWrapper(wrapStatus.outputPath, wrapStatus.outputFileName, outputZipPath, outputZipName)
    }

    log('Wrap status: ', status)
    return {
      status: wrapStatus.status,
      localPortal: cfg.localPortal
    }
  }
  catch (error) {
    log('Wrap failed: ', error)
    clearWrapper(wrapperPath)
    return {
      status: 1
    }
  }
}

module.exports = wrap

if (!module.parent) {
  let args = process.argv
  let platformName = args[2]
  let portalZipFile = args[3]
  let outputZipPath = args[4]
  let outputZipName = args[5]
  log(`Wrapping: ${platformName}`)
  // wrap('androidtv', '/Users/vladimir.aleksic/git/chameleon/dist/1.23.web.dev.21eca03.dev.zip','/Users/vladimir.aleksic/git/chameleon/dist/','test.zip')
  wrap(platformName, portalZipName, outputZipPath, outputZipName)
}
