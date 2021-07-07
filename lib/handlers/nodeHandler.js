const path = require('path')
const fs = require('fs')

const pkgFiles = [
  'package.json',
  'bower.json',
  'manifest.json'
]

const lockFiles = [
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

function updateVersion (newVersion, configPath) {
  const config = require(configPath)
  config.version = newVersion
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8')
}

function detectConfigFiles (cwd) {
  const pkgPath = pkgFiles.find((filename) => {
    try {
      const currPath = path.resolve(cwd, filename)
      if (require(currPath)) return currPath
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND' && err.code !== 'ENOENT') {
        throw err
      }
    }
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
