const printError = require('./lib/print-error')

const bump = require('./lib/lifecycles/bump')
const changelog = require('./lib/lifecycles/changelog')
const commit = require('./lib/lifecycles/commit')
const tag = require('./lib/lifecycles/tag')
const handlers = require('./lib/handlers').handlers
const defaults = require('./defaults')

module.exports = function standardVersion (argv) {
  var correctHandler, pkgPath
  handlers.forEach((handler) => {
    if (correctHandler) return
    pkgPath = handler.detectConfigFiles(process.cwd())
    if (pkgPath !== '') correctHandler = handler
  })

  if (!correctHandler) {
    return Promise.reject(new Error('no package file found'))
  }

  var pkg = {
    versionFiles: correctHandler.getVersionFiles(),
    version: correctHandler.fetchOldVersion(pkgPath),
    private: correctHandler.isPrivate(pkgPath),
    handler: correctHandler
  }

  var newVersion = pkg.version
  var args = Object.assign({}, defaults, argv)

  return Promise.resolve()
    .then(() => {
      return bump(args, pkg)
    })
    .then((_newVersion) => {
      // if bump runs, it calculaes the new version that we
      // should release at.
      if (_newVersion) newVersion = _newVersion
      return changelog(args, newVersion)
    })
    .then(() => {
      return commit(args, newVersion)
    })
    .then(() => {
      return tag(newVersion, pkg.private, args)
    })
    .catch((err) => {
      printError(args, err.message)
      throw err
    })
}
