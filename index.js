const path = require('path')
const semver = require('semver')
const fs = require('fs')

const printError = require('./lib/print-error')

const bump = require('./lib/lifecycles/bump')
const changelog = require('./lib/lifecycles/changelog')
const commit = require('./lib/lifecycles/commit')
const tag = require('./lib/lifecycles/tag')

module.exports = function standardVersion (argv) {
  var pkg, newVersion
  var defaults = require('./defaults')
  var args = Object.assign({}, defaults, argv)
  if (args.lang === defaults.lang) {
    bump.pkgFiles.forEach((filename) => {
      if (pkg) return
      var pkgPath = path.resolve(process.cwd(), filename)
      try {
        pkg = require(pkgPath)
      } catch (err) {}
    })
    if (!pkg) {
      return Promise.reject(new Error('no package file found'))
    }
    newVersion = pkg.version
  } else if (args.lang === 'python') {
    var pkgPath = path.resolve(process.cwd(), '__version__.py')
    try {
      pkg = fs.lstatSync(pkgPath)
    } catch (err) {}
    if (!pkg) {
      return Promise.reject(new Error('no version file found'))
    }
    var versionData = fs.readFileSync(pkgPath).toString().split('\n')[1]
    newVersion = semver.coerce(versionData).version
    pkg = { version: newVersion }
  }

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
