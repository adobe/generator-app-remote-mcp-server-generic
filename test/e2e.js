const yeoman = require('yeoman-environment')
const path = require('path')
const fs = require('fs-extra')
const theGenerator = require('../src/index')

async function main () {
  const targetFolder = path.join(process.cwd(), 'temp-template-test')

  fs.ensureDirSync(targetFolder)
  process.chdir(targetFolder)

  // TODO: add your options in here
  const options = {}

  const env = yeoman.createEnv()
  const gen = env.instantiate(
    theGenerator,
    {
      options
    }
  )

  await env.runGenerator(gen)
}

main()
  .catch(console.error)
