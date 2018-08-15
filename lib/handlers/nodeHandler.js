const path = require('path')
const writeFile = require('../write-file')

var pkgFiles = [
  'package.json',
  'bower.json',
  'manifest.json'
]

var lockFiles = [
  'package-lock.json',
  'npm-shrinkwrap.json'
]

function isPrivate (configPath) {
  return require(configPath).private || false
}

function getVersionFiles () {
  return pkgFiles.concat(lockFiles)
}

function fetchOldVersion (configPath) {
  return require(configPath).version
}

function updateVersion (args, newVersion, configPath) {
  var config = require(configPath)
  config.version = newVersion
  writeFile(args, configPath, JSON.stringify(config, null, 2) + '\n')
}

function detectConfigFiles (cwd) {
  var pkgPath, pkg
  try {
    pkgFiles.forEach((filename) => {
      if (pkg) return
      pkgPath = path.resolve(cwd, filename)
      pkg = require(pkgPath)
    })
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ENOENT') {
      throw new Error(err.message)
    }
  }

  if (!pkg) {
    return ''
  }

  return pkgPath
}

module.exports = {
  getVersionFiles,
  fetchOldVersion,
  updateVersion,
  detectConfigFiles,
  isPrivate
}
