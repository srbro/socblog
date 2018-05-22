require('shelljs/global')

var fs = require('fs')
var archiver = require('archiver')
var formData = require('form-data')
var childProcess = require('child_process')

var config = require('../config')
var argv = require('minimist')(process.argv.slice(2))

const PLATFORM_URLS = {
  samsung: 'tizen',
  androidtv: 'android',
  lg: 'webos'
}

if (!argv.serverUrl)
  throw new Error('You must specify "serverUrl" parameter.')
if (!argv.platform)
  throw new Error('You must specify "platform" parameter.')
if (argv.platform === 'lg' && !argv.tvName)
  throw new Error('You must specify "tvName" parameter when deploying for LG WebOS.')
if (argv.platform === 'androidtv' && !argv.tvAddress)
  throw new Error('You must specify "tvAddress" parameter when deploying for Android TV.')

// run build command to create build
childProcess.execSync(`yarn run build ${argv.platform}`)

// create a file to stream archive data to.
var output = fs.createWriteStream(__dirname + '/chameleon.zip')
var archive = archiver('zip', { store: true })

// listen for all archive data to be written
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes')

  // create form
  const form = new formData()

  // append serverUrl field in all cases
  form.append('url', argv.serverUrl)

  // append platform specific fields
  if (argv.platform === 'lg') {
    form.append('name', argv.tvName)
  }
  else if (argv.platform === 'androidtv') {
    form.append('tvAddress', argv.tvAddress)
  }

  // append generated zip
  form.append('projectZip', fs.createReadStream(__dirname + '/chameleon.zip'))

  // generate url based on platform and config
  const url = `http://${config.testServerIp}:${config.testServerPort}/${PLATFORM_URLS[argv.platform]}/saveAndLaunch`

  // post form to test server
  form.submit(url, function(err, res) {
    if (err) console.log(err)

    res.resume()
    rm(__dirname + '/chameleon.zip')
  })

})

// pipe archive data to the file
archive.pipe(output)

// append files from a directory
archive.directory(__dirname + '/../dist', 'dist')

// add tizen project folder if deploying for samsung
if (argv.platform === 'samsung') {
  archive.directory(__dirname + '/../smart/ucsamsung', 'tizen')
}

// finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize()
