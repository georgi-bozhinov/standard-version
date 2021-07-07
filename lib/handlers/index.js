const nodeHandler = require('./nodeHandler')
const pythonHandler = require('./pythonHandler')

module.exports = {
  handlers: [nodeHandler, pythonHandler]
}
