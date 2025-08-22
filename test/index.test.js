const helpers = require('yeoman-test')

const theGeneratorPath = require.resolve('../src/index')
const Generator = require('yeoman-generator')

describe('MCP I/O Runtime Generator', () => {
  test('exports a yeoman generator', () => {
    expect(require(theGeneratorPath).prototype).toBeInstanceOf(Generator)
  })

  describe('generator execution', () => {
    let runResult

    beforeEach(async () => {
      runResult = await helpers
        .run(theGeneratorPath)
        .withOptions({
          'skip-prompt': true,
          'project-name': 'test-mcp-server',
          'skip-install': true
        })
    })

    test('creates expected files', () => {
      runResult.assertFile('package.json')
      runResult.assertFile('app.config.yaml')
      runResult.assertFile('README.md')
      runResult.assertFile('TEMPLATE-FEATURES.md')
      runResult.assertFile('LICENSE')
      runResult.assertFile('actions/mcp-server/index.js')
      runResult.assertFile('actions/utils.js')
      runResult.assertFile('.gitignore')
      runResult.assertFile('jest.config.js')
      runResult.assertFile('.eslintrc.js')
      runResult.assertFile('.babelrc')
      runResult.assertFile('test/jest.setup.js')
      runResult.assertFile('test/mcp-server.test.js')
      runResult.assertFile('test/utils.test.js') // Added utils test from commonTemplates
      runResult.assertFile('workspace-config.example.json')
    })

    test('generates correct package.json', () => {
      runResult.assertFileContent('package.json', '"name": "test-mcp-server"')
      runResult.assertFileContent('package.json', '"description": "Model Context Protocol server with Adobe I/O Runtime"')
      runResult.assertFileContent('package.json', '"@adobe/aio-sdk"')
      runResult.assertFileContent('package.json', '"eslint"')
      runResult.assertFileContent('package.json', '"prettier"')
      runResult.assertFileContent('package.json', '"lint": "eslint actions/"')
      runResult.assertFileContent('package.json', '"test:watch": "jest --watch"')
    })

    test('generates correct app.config.yaml', () => {
      runResult.assertFileContent('app.config.yaml', 'test-mcp-server')
      runResult.assertFileContent('app.config.yaml', 'mcp-server:')
      runResult.assertFileContent('app.config.yaml', 'actions/mcp-server/index.js')
    })

    test('generates MCP server action', () => {
      runResult.assertFileContent('actions/mcp-server/index.js', 'TOOLS_CACHE')
      runResult.assertFileContent('actions/mcp-server/index.js', 'RESOURCES_CACHE')
      runResult.assertFileContent('actions/mcp-server/index.js', 'PROMPTS_CACHE')
      runResult.assertFileContent('actions/mcp-server/index.js', 'calculator')
      runResult.assertFileContent('actions/mcp-server/index.js', 'weather')
      runResult.assertFileContent('actions/mcp-server/index.js', 'echo')
      runResult.assertFileContent('actions/mcp-server/index.js', 'exports.main = main')
    })
  })

  describe('with prompts', () => {
    test('accepts custom project name through prompts', async () => {
      const runResult = await helpers
        .run(theGeneratorPath)
        .withPrompts({
          projectName: 'custom-mcp-name',
          description: 'Custom MCP description',
          author: 'Test Author',
          features: ['tools', 'resources'],
          includeExamples: true
        })
        .withOptions({
          'skip-install': true
        })

      runResult.assertFileContent('package.json', '"name": "custom-mcp-name"')
      runResult.assertFileContent('package.json', '"description": "Custom MCP description"')
    })
  })
})
