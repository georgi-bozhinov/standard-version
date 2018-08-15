const fs = require('fs')
const path = require('path')
const semver = require('semver')
const find = require('find')

const writeFile = require('../write-file')

var pkgFiles = [
  '__version__.py'
]

function isPrivate (_configPath) {
  return false
}

function getVersionFiles () {
  return pkgFiles
}

function fetchOldVersion (configPath) {
  var versionData = fs.readFileSync(configPath).toString().split('\n')[1]
  if (versionData) {
    return semver.coerce(versionData).version
  }
}

function updateVersion (args, newVersion, configPath) {
  writeFile(args, configPath, `''' Package version '''\n__version__ = ${JSON.stringify(newVersion)}\n`)
}

function detectConfigFiles (cwd) {
  var pkgPath
  var pkg = []
  pkgFiles.forEach((filename) => {
    if (pkg.length !== 0) return
    pkgPath = path.resolve(cwd, filename)

    pkg = find.fileSync(new RegExp(filename), cwd)
  })

  if (pkg.length === 0) {
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
