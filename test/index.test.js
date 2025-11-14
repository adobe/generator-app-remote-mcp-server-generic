/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
      // runResult.assertFile('LICENSE') // LICENSE file removed
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
      
      // Add explicit assertion for Jest
      expect(runResult.generator).toBeDefined()
    })

    test('generates correct package.json', () => {
      runResult.assertFileContent('package.json', '"name": "test-mcp-server"')
      runResult.assertFileContent('package.json', '"description": "Model Context Protocol server with Adobe I/O Runtime"')
      runResult.assertFileContent('package.json', '"@adobe/aio-sdk"')
      runResult.assertFileContent('package.json', '"eslint"')
      runResult.assertFileContent('package.json', '"prettier"')
      runResult.assertFileContent('package.json', '"lint": "eslint actions/"')
      runResult.assertFileContent('package.json', '"test:watch": "jest --watch"')
      
      // Add explicit assertion for Jest
      expect(runResult.generator).toBeDefined()
    })

    test('generates correct app.config.yaml', () => {
      runResult.assertFileContent('app.config.yaml', 'test-mcp-server')
      runResult.assertFileContent('app.config.yaml', 'mcp-server:')
      runResult.assertFileContent('app.config.yaml', 'actions/mcp-server/index.js')
      
      // Add explicit assertion for Jest
      expect(runResult.generator).toBeDefined()
    })

    test('generates MCP server action', () => {
      runResult.assertFileContent('actions/mcp-server/index.js', 'registerTools')
      runResult.assertFileContent('actions/mcp-server/index.js', 'registerResources')
      runResult.assertFileContent('actions/mcp-server/index.js', 'registerPrompts')
      runResult.assertFileContent('actions/mcp-server/index.js', 'createMcpServer')
      runResult.assertFileContent('actions/mcp-server/index.js', '@modelcontextprotocol/sdk')
      runResult.assertFileContent('actions/mcp-server/index.js', 'StreamableHTTPServerTransport')
      runResult.assertFileContent('actions/mcp-server/index.js', 'module.exports = { main }')
      
      // Add explicit assertion for Jest
      expect(runResult.generator).toBeDefined()
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
      
      // Add explicit assertion for Jest
      expect(runResult.generator).toBeDefined()
    })
  })
})
