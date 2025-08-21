const { stdout, stderr } = require('stdout-stderr')

process.on('unhandledRejection', error => {
  throw error
})

// trap console log
beforeEach(() => {
  stdout.start()
  stderr.start()
  stdout.print = false // set to true to see output
})

afterEach(() => {
  stdout.stop()
  stderr.stop()
})
