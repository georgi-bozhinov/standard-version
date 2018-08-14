const path = require('path')
const fs = require('fs')

const printError = require('./lib/print-error')
const fetchVersionHandlers = require('./lib/handlers/fetchVersionHandlers')

const bump = require('./lib/lifecycles/bump')
const changelog = require('./lib/lifecycles/changelog')
const commit = require('./lib/lifecycles/commit')
const tag = require('./lib/lifecycles/tag')

module.exports = function standardVersion (argv) {
  var pkg, newVersion, pkgPath
  var defaults = require('./defaults')
  var args = Object.assign({}, defaults, argv)
  bump.pkgFiles.forEach((filename) => {
    if (pkg) return

    pkgPath = path.resolve(process.cwd(), filename)
    try {
      pkg = require(pkgPath)
    } catch (err) {
      try {
        pkg = fs.lstatSync(pkgPath)
      } catch (err) {}
    }
  })
  if (!pkg) {
    return Promise.reject(new Error('no package file found'))
  }
  var handlers = fetchVersionHandlers(pkgPath)
  newVersion = handlers[args.lang]()
  pkg = {version: newVersion, private: pkg.private ? pkg.private : false}

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
