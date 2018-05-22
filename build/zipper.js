let fs = require('fs')
let archiver = require('archiver')
let log = console.log

const zip = function({sourcePath, inZipPath, inZipName, destinationPath, destinationName, debugMode}, zipFinishedFn) {
  let output = fs.createWriteStream(`${destinationPath}/${destinationName}`)
  let archive = archiver('zip', {
      forceZip64: false,
      zlib: { level: 9 } // Sets the compression level.
  })

  if (inZipName) {
    sourcePath = `${sourcePath}/${inZipName}`
  }

if (debugMode) {
  log('sourcePath: ' + sourcePath)
  log('inZipPath: ' + inZipPath)
  log('inZipName: ' + inZipName)
  log('destinationPath: ' + destinationPath)
  log('destinationName: ' + destinationName)
}

  output.on('close', function() {
    log('Zipper finished:' + archive.pointer() + ' total bytes');

    if (zipFinishedFn) {
      zipFinishedFn({stats: 'ok'})
    }

  });

  archive.on('error', function(err) {
    log('Zipper error: ', err)
    throw err
  })

  archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
    log('Zipper Warning ', err)
  } else {
    // throw error
    log('Zipper error: ', err)
    throw err;
  }
});

  log(`Zipping ${sourcePath}`)
  archive.pipe(output);

  if (fs.lstatSync(sourcePath).isDirectory()) {
    archive.directory(sourcePath, inZipPath)
  } else {
    archive.file(sourcePath, {name: inZipName})
  }
  archive.finalize();
}

module.exports = {
  'zip': zip
}
