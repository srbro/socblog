const build = require('./build')
const wrap = require('./wrap')
let args = process.argv
let productionBuild = 'wrapper.conf'
let productionBuildIndex = process.argv.indexOf('productionBuild')
if (productionBuildIndex > 0) {
  productionBuild = 'wrapper.prodConf'
  args.splice(productionBuildIndex, 1)
}
const platform = args[2]
const server = args[3]
const log = console.log

let buildResults = {
  server : server,
  app: '',
  portal: '',
  localPortal: true
}

build(args, function (err, builderInfo, portalFilePath, zipFileName) {
  if (!err) {
    let portalZipFile = `${portalFilePath}/${zipFileName}`
    buildResults.portal = portalZipFile

    let appZipFileName = `app.${builderInfo.devVersion}.zip`

    wrap(platform, portalZipFile, portalFilePath, appZipFileName, builderInfo.server, builderInfo.portalPath, productionBuild).then( (report) => {
      if (report.status === 0) {
        buildResults.app = `${portalFilePath}/${appZipFileName}`
        buildResults.version = `${builderInfo.versionStr}.${builderInfo.buildVersion}`
        buildResults.portalCommit = builderInfo.buildCommit

        if (report.localPortal !== undefined) {
          buildResults.localPortal = report.localPortal
        }

        JSON.stringify(buildResults).to(`${portalFilePath}/buildResults.json`)
        log('Wraping successfully finished')

      } else {
        log('Wrap returned ' + report.status + ' - exiting process')
        process.exit(1)
      }
    }).catch( (err) => {
      log('Wrap failed with error ' + err + ' - exiting process')
      process.exit(1)
    })
  } else {
    log(`Build failed with error ${err}`)
    process.exit(1)
  }
})
