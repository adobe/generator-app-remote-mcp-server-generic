<!--
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

# generator-app-remote-mcp-server-generic

[![Version](https://img.shields.io/npm/v/@adobe/generator-app-remote-mcp-server-generic.svg)](https://npmjs.org/package/@adobe/generator-app-remote-mcp-server-generic)
[![Downloads/week](https://img.shields.io/npm/dw/@adobe/generator-app-remote-mcp-server-generic.svg)](https://npmjs.org/package/@adobe/generator-app-remote-mcp-server-generic)
[![Node.js CI](https://github.com/adobe/generator-app-remote-mcp-server-generic/actions/workflows/node.js.yml/badge.svg)](https://github.com/adobe/generator-app-remote-mcp-server-generic/actions/workflows/node.js.yml)
[![License](https://img.shields.io/npm/l/@adobe/generator-app-remote-mcp-server-generic.svg)](https://github.com/adobe/generator-app-remote-mcp-server-generic/blob/main/package.json)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/adobe/generator-app-remote-mcp-server-generic/master.svg?style=flat-square)](https://codecov.io/gh/adobe/generator-app-remote-mcp-server-generic/)

An Adobe Developer App Builder template for creating Model Context Protocol (MCP) servers using Adobe I/O Runtime.

## What is this template?

This template helps you quickly bootstrap a **Model Context Protocol (MCP) server** that runs on Adobe I/O Runtime. MCP is an open protocol that enables secure connections between host applications (like Claude Desktop, IDEs, or other AI tools) and local services.

### Key Features

- 🚀 **Serverless MCP Server**: Deploy MCP servers to Adobe I/O Runtime with automatic scaling
- 🛠️ **Full MCP Implementation**: Supports Tools, Resources, and Prompts
- 📝 **Interactive Setup**: Guided prompts to configure your MCP server
- 🔧 **Production Ready**: Includes error handling, logging, and best practices
- 📚 **Documentation**: Comprehensive README and examples included

## Quick Start

### Prerequisites

- Node.js 14 or higher
- Adobe I/O CLI: `npm install -g @adobe/aio-cli`
- Adobe Developer Console project with I/O Runtime enabled

### Install the Template

Using Adobe I/O CLI:

```bash
aio app init my-mcp-server --template @adobe/generator-app-remote-mcp-server-generic
```

Or using npm:

```bash
npm create @adobe/aio-app my-mcp-server --template @adobe/generator-app-remote-mcp-server-generic
```

### What gets created

The template generates a complete MCP server with:

```
my-mcp-server/
├── actions/
│   ├── mcp-server/
│   │   └── index.js          # Main MCP server action
│   └── utils.js              # Utility functions
├── app.config.yaml           # Adobe I/O Runtime configuration
├── package.json              # Dependencies and scripts
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## Model Context Protocol (MCP) Features

### Tools
Allow AI assistants to call your custom functions:
- Execute code
- Perform calculations
- Access external APIs
- Process data

### Resources
Provide access to data sources and content:
- Read files
- Query databases
- Fetch web content
- Access APIs

### Prompts
Define reusable prompt templates:
- System prompts
- User prompt templates
- Dynamic prompt generation

## Development Workflow

### 1. Local Development

```bash
cd my-mcp-server
npm install
npm run dev
```

### 2. Deploy to Adobe I/O Runtime

```bash
npm run deploy
```

### 3. Test your MCP Server

Your MCP server will be available at the Adobe I/O Runtime action URL provided after deployment.

## Template Configuration

### install.yml

This template follows the [Adobe App Builder template specification](https://developer.adobe.com/app-builder-template-registry/guides/creating_template/):

- **Categories**: `action`, `helper-template`
- **Runtime**: Enabled for Adobe I/O Runtime
- **Workspaces**: Creates a default workspace
- **APIs**: No specific APIs required (configurable)

### Interactive Prompts

The template includes interactive prompts for:
- Project name validation
- Project description
- Author information
- MCP feature selection (Tools, Resources, Prompts)
- Example implementations

## Testing the Template

### Unit Tests

Run the template's unit tests:

```bash
npm test
```

### End-to-End Testing

Test the template generator:

```bash
npm run e2e
```

This creates a `temp-template-test` folder and runs the generator to verify everything works correctly.

## Template Development

### Project Structure

```
template/
├── src/
│   ├── index.js              # Yeoman generator
│   └── templates/            # Template files
│       ├── actions/          # MCP server implementation
│       ├── package.json      # Generated project package.json
│       ├── app.config.yaml   # Adobe I/O Runtime config
│       ├── README.md         # Generated project README
│       └── _dot.gitignore    # Generated .gitignore
├── test/                     # Template tests
├── install.yml               # Template configuration
└── package.json              # Template package.json
```

### Customizing the Template

1. **Modify Templates**: Edit files in `src/templates/` to change what gets generated
2. **Update Generator**: Modify `src/index.js` to change prompts and generation logic
3. **Add Features**: Extend the MCP server implementation in `src/templates/actions/mcp-server/index.js`

## Publishing to Adobe Template Registry

1. **Publish to npm**:
   ```bash
   npm publish
   ```

2. **Submit to Registry**:
   - Go to [Adobe Template Submission](https://github.com/adobe/aio-template-submission/issues)
   - Create a new "Template Update Request" issue
   - Provide your npm module name: `@adobe/generator-app-remote-mcp-server-generic`

## Resources

- 📚 [Model Context Protocol Specification](https://modelcontextprotocol.io)
- 🏗️ [Adobe I/O Runtime Documentation](https://developer.adobe.com/runtime/docs/)
- 🛠️ [Adobe App Builder](https://developer.adobe.com/app-builder/)
- 📖 [Creating App Builder Templates](https://developer.adobe.com/app-builder-template-registry/guides/creating_template/)
- 🎯 [Yeoman Generator Authoring](https://yeoman.io/authoring/)

# Contributing

Contributions are welcomed! Read the [Contributing Guide](CONTRIBUTING.md) for more information.

# Licensing

This project is licensed under the Apache V2 License. See [LICENSE](LICENSE) for more information.
