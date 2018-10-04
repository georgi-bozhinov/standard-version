const path = require('path')

const printError = require('./lib/print-error')

const bump = require('./lib/lifecycles/bump')
const changelog = require('./lib/lifecycles/changelog')
const commit = require('./lib/lifecycles/commit')
const tag = require('./lib/lifecycles/tag')
const defaults = require('./defaults')
const checkpoint = require('./lib/checkpoint')

module.exports = function standardVersion (argv) {
  let correctHandler, pkgPath
  const args = Object.assign({}, defaults, argv)

  let handlers = require('./lib/handlers').handlers

  if (args.langPkg && args.langPkg !== defaults.langPkg) {
    const langPath = path.resolve(process.cwd(), args.langPkg)
    handlers = [require(langPath)]
  }

  handlers.forEach((handler) => {
    if (correctHandler) return
    pkgPath = handler.detectConfigFiles(process.cwd())
    if (pkgPath !== '') correctHandler = handler
  })

  if (!correctHandler) {
    return Promise.reject(new Error('no package file found'))
  }

  checkpoint(args, 'detected project with config file ' + path.basename(pkgPath), [])

  const pkg = {
    versionFiles: correctHandler.getVersionFiles(),
    version: correctHandler.fetchOldVersion(pkgPath),
    private: correctHandler.isPrivate(pkgPath),
    handler: correctHandler
  }

  let newVersion = pkg.version

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
      if (args.commit) {
        return commit(args, newVersion)
      } else {
        return Promise.resolve()
      }
    })
    .then(() => {
      if (args.commit) {
        return tag(newVersion, pkg.private, args)
      } else {
        return Promise.resolve()
      }
    })
    .catch((err) => {
      printError(args, err.message)
      throw err
    })
}
