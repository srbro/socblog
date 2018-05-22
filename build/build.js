// https://github.com/shelljs/shelljs
require('./check-versions')()
require('shelljs/global')
env.NODE_ENV = 'production'

const path = require('path')
const config = require('../config')
const ora = require('ora')
const webpack = require('webpack')
const webpackConfig = require('./webpack.prod.conf')
const fs = require('fs');
const zipper = require('./zipper.js')

function build (args, clbkFn) {
  let measure = false

  let measureIndex = process.argv.indexOf('performance')
  if (measureIndex > 0) {
    measure = true
    let args = process.argv.splice(measureIndex, 1)
  }

  const platform = require('../config/platforms')[args[2] || config.defaultPlatform]
  const server = args[3] || config.defaultServer
  const provider = args[4] || config.defaultProvider
  const pathVersion = args[5] || config.defaultPathVersion
  const buildVersion = args[6] || config.defaultBuildVersion
  const buildTime = new Date().toString()

  let buildCommit = 'unknown'

  if (which('git')) {
    let gitsha = exec("git log --pretty=format:'%h' -n 1")
    if (gitsha.code === 0) {
      buildCommit = gitsha.stdout
    } else {
      echo('Error: Git commit failed');
      exit(1);
    }

  } else {
    echo('Sorry, this script requires git');
    exit(1);
  }

  console.log(`\n---------------------------------`)
  console.log(`  Platform        : ${platform.name}`)
  console.log(`  Server config   : ${server}`)
  console.log(`  Provider        : ${provider}`)
  console.log(`  Path version    : ${pathVersion}`)
  console.log(`  Build version   : ${buildVersion}`)
  console.log(`  Build time      : ${buildTime}`)
  console.log(`  Build commit    : ${buildCommit}`)
  console.log(`  Log performance : ${measure}`)
  console.log(`---------------------------------\n`)

  console.log(
    '  Tip:\n' +
    '  Built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
  )

  const spinner = ora('building for production...')
  spinner.start()

  const assetsPath = `${config.build.assetsRoot}/portal/${provider}/${platform.name}`
  const portalPath = `/portal/${provider}/${platform.name}/${pathVersion}`
  const buildtimePath = `${config.build.assetsRoot}/portal/${provider}/${platform.name}/${pathVersion}`
  const versionPath = `${buildtimePath}/version.json`
  const versionUri = `/portal/${provider}/${platform.name}/${pathVersion}/version.json`
  const ver = JSON.parse(fs.readFileSync(`version.json`, 'utf8'));
  const versionStr = `${ver.major}.${ver.minor}.${ver.patch}`

  const devVersion = `${platform.name}.${ver.major}.${ver.minor}.${ver.patch}.${buildVersion}.${buildCommit}.${server}`
  const portalZipName = `portal.${devVersion}.zip`
  const zipPath = `${config.build.assetsRoot}`

  // Following lines are added to support launch of samsung portal on crocodile
  const platformPath = `/portal/${provider}/${platform.name}`
  const buildtimePlatformPath = `${config.build.assetsRoot}/portal/${provider}/${platform.name}`
  // END

  console.log(`  Version path : ${versionPath}`)
  console.log(`  Version      : ${versionStr}`)
  console.log(`  Portal path  : ${portalPath}`)
  console.log(`  Zip name     : ${portalZipName}`)
  // platform.ownAssets
  //   ? path.join(config.build.assetsRoot, config.build.assetsSubDirectory, platform.name)
  //   : path.join(config.build.assetsRoot, config.build.assetsSubDirectory)

  rm('-rf', assetsPath)
  mkdir('-p', assetsPath)

  mkdir('-p', buildtimePath)
  cp('-R', 'index-redirection.html', `${assetsPath}/index.html`)
  let buildTimeString = buildTime + '\n'
  buildTimeString.to(`${buildtimePath}/buildtime.txt`)
  buildVersion.toEnd(`${buildtimePath}/buildtime.txt`)
  buildCommit.toEnd(`${buildtimePath}/buildtime.txt`)
  cp('-R', 'version.json', `${versionPath}`)

  let builderInfo = {
    devVersion,
    versionStr,
    buildVersion,
    server,
    buildCommit,
    buildTime,
    portalPath
  }

  webpack(webpackConfig({platform, provider, server, pathVersion, versionUri, measure, builder: builderInfo}), function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n')
    if (stats.hasErrors()) {
      process.exit(1)
    } else {
      zipper.zip({
        'sourcePath': buildtimePlatformPath,
        'inZipPath': platformPath,
        'destinationPath': config.build.assetsRoot,
        'destinationName': portalZipName,
      }, function(zipStats) {
           console.log('Realy finished building')
           if (clbkFn) {
             clbkFn(null, builderInfo, config.build.assetsRoot, portalZipName)
           }
      })
    }
  })
}

module.exports = build

if (!module.parent) {
  build(process.argv)
}
