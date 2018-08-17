const fs = require('fs')
const path = require('path')
const semver = require('semver')
const find = require('find')

const pkgFiles = [
  'VERSION'
]

function isPrivate (_configPath) {
  return false
}

function getVersionFiles () {
  return pkgFiles
}

function fetchOldVersion (configPath) {
  const versionData = fs.readFileSync(configPath).toString().split('\n')[1]
  if (versionData) {
    return semver.coerce(versionData).version
  }
}

function updateVersion (newVersion, configPath) {
  fs.writeFileSync(configPath, `${newVersion}\n`)
}

function detectConfigFiles (cwd) {
  const pkgPath = pkgFiles.find((filename) => {
    return find.fileSync(new RegExp(filename), cwd).length > 0
  })

  return pkgPath ? path.resolve(cwd, pkgPath) : ''
}

module.exports = {
  getVersionFiles,
  fetchOldVersion,
  updateVersion,
  detectConfigFiles,
  isPrivate
}
