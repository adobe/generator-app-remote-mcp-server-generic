/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Generator = require('yeoman-generator')
const path = require('path')

/*
 * Adobe I/O Runtime MCP Server Template Generator
 *
 * Yeoman generator lifecycle:
 * - initializing
 * - prompting
 * - configuring
 * - default
 * - writing
 * - conflicts
 * - install
 * - end
 */

class McpIoRuntimeGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts)

    // options are inputs from CLI or yeoman parent generator
    this.option('skip-prompt', {
      type: Boolean,
      default: false,
      description: 'Skip interactive prompts and use defaults'
    })
    this.option('project-name', {
      type: String,
      default: '',
      description: 'Name of the MCP project'
    })
    this.option('description', {
      type: String,
      default: '',
      description: 'Project description'
    })
    this.option('author', {
      type: String,
      default: '',
      description: 'Project author'
    })

    // Initialize props with defaults
    this.props = {
      features: ['tools', 'resources', 'prompts'], // Default features
      includeExamples: true
    }
  }

  async initializing () {
    this.log('🚀 Initializing Adobe I/O Runtime MCP Server template...')

    // Set default values
    this.props = {
      ...this.props, // Keep existing defaults
      projectName: this.options['project-name'] || 'my-mcp-server',
      description: this.options.description || 'Model Context Protocol server with Adobe I/O Runtime',
      author: this.options.author || 'Your Name',
      mcpVersion: '2024-11-05',
      aioSdkVersion: '^3.0.0'
    }
  }

  async prompting () {
    // Skip prompts if skip-prompt option is set
    if (this.options['skip-prompt']) {
      this.log('⏭️  Skipping prompts, using default values...')
      return
    }

    this.log('📝 Please provide some information about your MCP server:')

    const prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: this.props.projectName,
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Project name is required'
          }
          // Validate project name format (lowercase, hyphens allowed)
          if (!/^[a-z0-9-]+$/.test(input)) {
            return 'Project name should only contain lowercase letters, numbers, and hyphens'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: this.props.description
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: this.props.author
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which MCP features would you like to include?',
        choices: [
          {
            name: 'Tools - Allow AI assistants to call your functions',
            value: 'tools',
            checked: true
          },
          {
            name: 'Resources - Provide access to data and content',
            value: 'resources',
            checked: true
          },
          {
            name: 'Prompts - Define reusable prompt templates',
            value: 'prompts',
            checked: true
          }
        ]
      },
      {
        type: 'confirm',
        name: 'includeExamples',
        message: 'Include example implementations?',
        default: true
      }
    ]

    const answers = await this.prompt(prompts)

    // Merge answers with existing props
    this.props = { ...this.props, ...answers }
  }

  async configuring () {
    this.log('⚙️  Configuring MCP server template...')

    // Normalize project name for use in file names and package.json
    this.props.normalizedProjectName = this.props.projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async writing () {
    this.log('📁 Writing MCP server files...')

    const destFolder = '.'
    this.sourceRoot(path.join(__dirname, './templates/'))

    // Copy template files with template processing
    const templateProps = {
      ...this.props,
      projectName: this.props.normalizedProjectName
    }

    // Copy main template files
    const filesToCopy = [
      'package.json',
      'app.config.yaml',
      'README.md',
      'TEMPLATE-FEATURES.md',
      'LICENSE',
      'webpack.config.js',
      'jest.config.js',
      '.eslintrc.js',
      '.babelrc',
      'actions/mcp-server/index.js',
      'actions/mcp-server/webpack.config.js',
      'actions/utils.js',
      'test/jest.setup.js',
      'test/mcp-server.test.js',
      'workspace-config.example.json'
    ]

    filesToCopy.forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(path.join(destFolder, file)),
        templateProps
      )
    })

    // Copy .gitignore file (renamed from _dot.gitignore to avoid npm pack issues)
    this.fs.copyTpl(
      this.templatePath('_dot.gitignore'),
      this.destinationPath(path.join(destFolder, '.gitignore')),
      templateProps
    )

    // Copy other template files
    this.fs.copyTpl(
      this.templatePath('index.js'),
      this.destinationPath(path.join(destFolder, 'index.js')),
      templateProps
    )
  }

  async install () {
    this.log('📦 Installing dependencies...')

    if (!this.options['skip-install']) {
      await this.spawnCommand('npm', ['install'])
    } else {
      this.log('⏭️  Skipping dependency installation')
    }
  }

  async end () {
    this.log('')
    this.log('🎉 Your MCP server template has been created successfully!')
    this.log('')
    this.log('Next steps:')
    this.log('1. Install Adobe I/O CLI: npm install -g @adobe/aio-cli')
    this.log('2. Configure your Adobe Developer Console project')
    this.log('3. Run "aio app deploy" to deploy your MCP server')
    this.log('')
    this.log('📚 Learn more about MCP: https://modelcontextprotocol.io')
    this.log('📖 Adobe I/O Runtime docs: https://developer.adobe.com/runtime/docs/')
    this.log('')

    // Ensure install.yml is available for AIO CLI validation
    const installYmlSource = this.templatePath('../../install.yml')
    const installYmlDest = this.destinationPath('node_modules/@adobe/generator-app-remote-mcp-server-generic/install.yml')

    try {
      // Create the directory structure if it doesn't exist
      const fs = require('fs')
      const path = require('path')
      const destDir = path.dirname(installYmlDest)

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }

      // Copy install.yml to the expected location
      if (fs.existsSync(installYmlSource)) {
        fs.copyFileSync(installYmlSource, installYmlDest)
      }
    } catch (error) {
      // Silently ignore errors - this is just to prevent the AIO CLI warning
    }
  }
}

module.exports = McpIoRuntimeGenerator
