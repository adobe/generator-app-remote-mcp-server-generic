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

const path = require('path')
const { ActionGenerator, commonTemplates } = require('@adobe/generator-app-common-lib')

/**
 * Adobe I/O Runtime MCP Server Template Generator
 *
 * Creates a complete Model Context Protocol server for Adobe I/O Runtime.
 * Extends ActionGenerator for professional utilities and MCP v2024-11-05 compliance.
 *
 * Lifecycle: initializing → prompting → configuring → writing → install → end
 */

class McpIoRuntimeGenerator extends ActionGenerator {
  /**
   * @param {Array} args - Command line arguments
   * @param {Object} opts - Generator options
   */
  constructor (args, opts) {
    // Set required ActionGenerator options
    opts = opts || {}
    opts['action-folder'] = opts['action-folder'] || 'actions'
    opts['config-path'] = opts['config-path'] || 'app.config.yaml'
    opts['full-key-to-manifest'] = opts['full-key-to-manifest'] || 'application.runtimeManifest'
    super(args, opts)

    // CLI options for non-interactive usage
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

    // Initialize default properties
    this.props = {
      features: ['tools', 'resources', 'prompts'],
      includeExamples: true
    }
  }

  /**
   * Set up initial state and merge CLI options
   */
  async initializing () {
    this.log('🚀 Initializing Adobe I/O Runtime MCP Server template...')

    // Merge CLI options with defaults
    this.props = {
      ...this.props,
      projectName: this.options['project-name'] || 'my-mcp-server',
      description: this.options.description || 'Model Context Protocol server with Adobe I/O Runtime',
      author: this.options.author || 'Your Name',
      mcpVersion: '2024-11-05',
      aioSdkVersion: '^3.0.0'
    }
  }

  /**
   * Collect user input via interactive prompts
   */
  async prompting () {
    // Skip prompts if requested
    if (this.options['skip-prompt']) {
      this.log('⏭️  Skipping prompts, using default values...')
      return
    }

    this.log('📝 Please provide some information about your MCP server:')

    // Define prompts with validation
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
          // Validate npm package naming conventions
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

    // Execute prompts and merge answers
    const answers = await this.prompt(prompts)
    this.props = { ...this.props, ...answers }
  }

  /**
   * Process and normalize user inputs
   */
  async configuring () {
    this.log('⚙️  Configuring MCP server template...')

    // Normalize project name for npm compatibility
    this.props.normalizedProjectName = this.props.projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * Generate all template files
   */
  async writing () {
    this.log('📁 Writing MCP server files...')

    const destFolder = '.'
    this.sourceRoot(path.join(__dirname, './templates/'))

    // Prepare template variables for EJS processing
    const templateProps = {
      ...this.props,
      projectName: this.props.normalizedProjectName || this.props.projectName,
      description: this.props.description || 'Model Context Protocol server with Adobe I/O Runtime',
      author: this.props.author || 'Your Name',
      utilsRelPath: '../actions/utils'
    }

    // Copy template files with EJS processing
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
      'actions/mcp-server/tools.js',
      'actions/mcp-server/webpack.config.js',
      'test/jest.setup.js',
      'test/mcp-server.test.js',
      'workspace-config.example.json'
    ]

    // Process each template file
    filesToCopy.forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(path.join(destFolder, file)),
        templateProps
      )
    })

    // Use Adobe's commonTemplates for utilities
    this.fs.copyTpl(
      commonTemplates.utils,
      this.destinationPath(path.join(destFolder, 'actions/utils.js')),
      templateProps
    )

    // Use Adobe's commonTemplates for utility tests
    this.fs.copyTpl(
      commonTemplates['utils.test'],
      this.destinationPath(path.join(destFolder, 'test/utils.test.js')),
      templateProps
    )

    // Copy .gitignore (renamed from _dot.gitignore to avoid npm pack issues)
    this.fs.copyTpl(
      this.templatePath('_dot.gitignore'),
      this.destinationPath(path.join(destFolder, '.gitignore')),
      templateProps
    )

    // Copy main entry point
    this.fs.copyTpl(
      this.templatePath('index.js'),
      this.destinationPath(path.join(destFolder, 'index.js')),
      templateProps
    )
  }

  /**
   * Install project dependencies
   */
  async install () {
    this.log('📦 Installing dependencies...')

    if (!this.options['skip-install']) {
      await this.spawnCommand('npm', ['install'])
    } else {
      this.log('⏭️  Skipping dependency installation')
    }
  }

  /**
   * Display completion message and perform final setup
   */
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

    // Copy install.yml for AIO CLI compatibility
    const installYmlSource = this.templatePath('../../install.yml')
    const installYmlDest = this.destinationPath('node_modules/@adobe/generator-app-remote-mcp-server-generic/install.yml')

    try {
      const fs = require('fs')
      const path = require('path')
      const destDir = path.dirname(installYmlDest)

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }

      if (fs.existsSync(installYmlSource)) {
        fs.copyFileSync(installYmlSource, installYmlDest)
      }
    } catch (error) {
      // Silently ignore errors
    }
  }
}

// Export generator for Yeoman and aio CLI
module.exports = McpIoRuntimeGenerator
