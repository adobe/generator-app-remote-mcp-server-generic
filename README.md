<!--
Copyright 2025 Adobe. All rights reserved.
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

Adobe App Builder template for creating **Model Context Protocol (MCP) servers** using the official **MCP TypeScript SDK** and Adobe I/O Runtime.

## What is this template?

Generate **MCP servers** that run on Adobe I/O Runtime. Connect AI assistants like Cursor, Claude Desktop, and other AI tools to your custom functions, data, and prompts through the standardized MCP protocol.

### Key Features

- 🔧 **Official MCP TypeScript SDK**: Built with `@modelcontextprotocol/sdk` v1.17.4
- 📝 **Type Safety**: Zod schema validation for all parameters
- 🚀 **Serverless Ready**: Deploy to Adobe I/O Runtime with auto-scaling
- 🛠️ **Complete MCP Implementation**: Tools, Resources, and Prompts support
- 📚 **Production Ready**: Error handling, logging, and CORS included

## Quick Start

### Prerequisites
- Node.js 18+ 
- Adobe I/O CLI: `npm install -g @adobe/aio-cli`
- Adobe Developer Console project with I/O Runtime enabled

### Generate Project

```bash
# Using Adobe I/O CLI
aio app init my-mcp-server --template @adobe/generator-app-remote-mcp-server-generic

# Or using npm
npm create @adobe/aio-app my-mcp-server --template @adobe/generator-app-remote-mcp-server-generic
```

### Deploy & Use

```bash
cd my-mcp-server
npm install
npm run deploy
```

Connect to your deployed MCP server in Cursor or Claude Desktop using the provided URL.

## Generated Project Structure

```
my-mcp-server/
├── actions/mcp-server/
│   ├── index.js          # Main MCP server (SDK-powered)
│   └── tools.js          # Tools, resources & prompts
├── app.config.yaml       # Adobe I/O Runtime config
├── package.json          # Dependencies (includes MCP SDK)
└── README.md             # Complete usage guide
```

## MCP Features

**Tools**: Interactive functions AI assistants can call (echo, calculator, weather)
**Resources**: Static content access (documentation, data, files)  
**Prompts**: Reusable prompt templates with parameters

All implemented using the official MCP TypeScript SDK with type-safe Zod schemas.

## Development

### Testing the Generator

```bash
# Run unit tests
npm test

# Test end-to-end generation
npm run e2e
```

### Customizing the Template

1. **Modify Templates**: Edit files in `src/templates/`
2. **Update Generator**: Modify `src/index.js` for prompts/logic
3. **Extend Features**: Add capabilities in `src/templates/actions/mcp-server/tools.js`

### Publishing

```bash
# Publish to npm
npm publish

# Submit to Adobe Template Registry
# Create issue at: https://github.com/adobe/aio-template-submission/issues
```

## Resources

- 📚 [MCP Documentation](https://modelcontextprotocol.io/docs)
- 🔧 [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- 🏗️ [Adobe I/O Runtime](https://developer.adobe.com/runtime/docs/)
- 📖 [App Builder Templates](https://developer.adobe.com/app-builder-template-registry/guides/creating_template/)

## License

Apache V2 License - see [LICENSE](LICENSE) for details.