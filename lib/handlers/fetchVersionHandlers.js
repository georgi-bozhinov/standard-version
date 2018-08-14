const semver = require('semver')
const fs = require('fs')

function fetchNodeVersion (configPath) {
  return require(configPath).version
}

function fetchPythonVersion (configPath) {
  var versionData = fs.readFileSync(configPath).toString().split('\n')[1]
  if (versionData) {
    return semver.coerce(versionData).version
  }
}

module.exports = function fetchVersion (configPath) {
  return {
    nodejs: function () { return fetchNodeVersion(configPath) },
    python: function () { return fetchPythonVersion(configPath) }
  }
}
