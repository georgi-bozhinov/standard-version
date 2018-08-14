const writeFile = require('../write-file')

function writeToNodeConfig (args, newVersion, configPath) {
  var config = require(configPath)
  config.version = newVersion
  writeFile(args, configPath, JSON.stringify(config, null, 2) + '\n')
}

function writeToPythonConfig (args, newVersion, configPath) {
  writeFile(args, configPath, '__version__ = ' + JSON.stringify(newVersion))
}

module.exports = function writeToConfig (args, newVersion, configPath) {
  return {
    nodejs: function () { writeToNodeConfig(args, newVersion, configPath) },
    python: function () { writeToPythonConfig(args, newVersion, configPath) }
  }
}
