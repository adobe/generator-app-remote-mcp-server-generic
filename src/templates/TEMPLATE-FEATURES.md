# MCP Server Template Features

This template provides a comprehensive foundation for building Model Context Protocol (MCP) servers that run on Adobe I/O Runtime. Below are the key features and capabilities included in this template.

## 🔧 Core MCP Implementation

### Protocol Compliance
- **MCP v2024-11-05**: Full compliance with the latest MCP specification
- **JSON-RPC 2.0**: Complete JSON-RPC protocol implementation
- **Streamable HTTP**: Optimized for stateless serverless environments
- **CORS Support**: Ready for browser-based MCP clients

### Server Capabilities
- **Tools**: Interactive functions that AI assistants can call
- **Resources**: Static content and data access
- **Prompts**: Reusable prompt templates with parameters
- **Logging**: Comprehensive logging with configurable levels

## 🛠️ Built-in Tools

### Echo Tool
- **Purpose**: Testing connectivity and debugging
- **Parameters**: `message` (string)
- **Use Case**: Verify MCP server is responding correctly

### Calculator Tool
- **Purpose**: Mathematical calculations
- **Parameters**: 
  - `expression` (string): Math expression to evaluate
  - `format` (enum): Output format (decimal, scientific, fraction)
- **Features**: Basic arithmetic with configurable output formatting
- **Security**: Input sanitization (production should use proper math parser)

### Weather Tool
- **Purpose**: Demonstrates external API integration
- **Parameters**: `city` (string)
- **Features**: 
  - Mock weather data with realistic variations
  - Structured metadata output
  - Error handling examples
- **Customization**: Ready to replace with real weather API calls

## 📚 Resources

### Example Resource (`example://resource1`)
- **Type**: Plain text
- **Purpose**: Demonstrates basic resource functionality
- **Content**: Sample text content

### API Documentation (`docs://api`)
- **Type**: Markdown
- **Purpose**: Shows how to provide structured documentation
- **Content**: Example REST API documentation

### Configuration Settings (`config://settings`)
- **Type**: JSON
- **Purpose**: Configuration reference example
- **Content**: Server configuration schema

## 💬 Prompts

### Weather Info Prompt
- **Purpose**: Explains weather tool functionality
- **Parameters**: `city` (optional)
- **Template**: Dynamic prompt generation with parameter substitution

## 🚀 Development Infrastructure

### Build System
- **Webpack**: Optimized bundling for I/O Runtime
- **Babel**: Modern JavaScript transpilation
- **Target**: Node.js 18+ runtime environment

### Testing Framework
- **Jest**: Comprehensive test suite
- **Coverage**: Full code coverage reporting
- **Mocking**: Adobe I/O SDK mocks included
- **Test Utilities**: Helper functions for MCP request testing

### Code Quality
- **ESLint**: Code linting with recommended rules
- **Prettier**: Code formatting (manual via npm script)
- **Security Rules**: Basic security rule enforcement

### Package Management
- **NPM Scripts**: Complete development workflow
- **Dependencies**: Minimal production footprint
- **Dev Dependencies**: Full development toolchain

## 🔧 Configuration Files

### Package.json Features
- **Scripts**: Build, test, deploy, lint, format workflows
- **Engines**: Node.js version requirements
- **Keywords**: Optimized for discovery
- **Repository**: Template for git repository information
- **License**: MIT license template

### Adobe I/O Runtime Configuration
- **App Config**: Production-ready I/O Runtime settings
- **Resource Limits**: Optimized memory and timeout settings
- **Annotations**: Proper web action configuration
- **Raw HTTP**: Enabled for MCP protocol compatibility

### Jest Configuration
- **Node Environment**: Configured for server-side testing
- **Coverage**: HTML, LCOV, and text reports
- **Setup**: Global test utilities and mocks
- **Timeout**: Extended timeout for I/O Runtime tests

### ESLint Configuration
- **Node Environment**: Server-side JavaScript rules
- **ES2021**: Modern JavaScript feature support
- **Security**: Basic security rule enforcement
- **Ignored Patterns**: Excludes build artifacts and dependencies

### Babel Configuration
- **Preset Env**: Node.js 18 target configuration
- **Modern Features**: Latest JavaScript feature support

## 📁 Project Structure

```
your-mcp-server/
├── actions/
│   └── mcp-server/
│       ├── index.js          # Main MCP server implementation
│       └── webpack.config.js # Action-specific webpack config
├── test/
│   ├── jest.setup.js         # Test environment setup
│   └── mcp-server.test.js    # Comprehensive test suite
├── .babelrc                  # Babel configuration
├── .eslintrc.js             # ESLint configuration
├── .gitignore               # Git ignore patterns
├── app.config.yaml          # Adobe I/O Runtime config
├── jest.config.js           # Jest test configuration
├── LICENSE                  # MIT license
├── package.json             # Project configuration
├── README.md                # Documentation
├── TEMPLATE-FEATURES.md     # This file
├── webpack.config.js        # Main webpack config
└── workspace-config.example.json # Adobe workspace example
```

## 🔄 Development Workflow

### Local Development
1. `npm run dev` - Start local development server
2. `npm test` - Run test suite
3. `npm run lint` - Check code quality
4. `npm run format` - Format code

### Deployment
1. `npm run build` - Bundle for production
2. `npm run deploy` - Deploy to Adobe I/O Runtime
3. `npm run undeploy` - Remove deployment

### Testing
1. `npm test` - Run all tests
2. `npm run test:watch` - Watch mode for development
3. Coverage reports in `coverage/` directory

## 🎯 Customization Points

### Adding New Tools
1. Add tool definition to `TOOLS_CACHE` in `actions/mcp-server/index.js`
2. Implement tool handler function
3. Add tests in `test/mcp-server.test.js`

### Adding New Resources
1. Add resource to `RESOURCES_CACHE`
2. Define resource content and metadata
3. Test resource access

### Adding New Prompts
1. Add prompt to `PROMPTS_CACHE`
2. Define parameters and template
3. Test prompt generation

### Configuration Updates
- Modify `app.config.yaml` for runtime settings
- Update `package.json` for project metadata
- Adjust `jest.config.js` for test configuration

## 🔐 Security Considerations

### Built-in Security
- Input sanitization in calculator tool
- CORS configuration for cross-origin requests
- No authentication required (suitable for public MCP servers)

### Production Recommendations
- Replace `eval()` in calculator with proper math parser
- Add input validation for all tools
- Implement rate limiting if needed
- Add authentication for sensitive operations
- Use environment variables for API keys

## 📈 Performance Features

### Serverless Optimization
- Stateless design for cold start efficiency
- Global caches for tool/resource definitions
- Minimal dependency footprint
- Optimized bundle size with webpack

### Monitoring
- Comprehensive logging with Adobe I/O Logger
- Error tracking and reporting
- Performance metrics available through I/O Runtime

## 🤝 Integration Support

### AI Assistant Compatibility
- **Cursor IDE**: Streamable HTTP transport
- **Claude Desktop**: Standard MCP protocol
- **Custom Clients**: Full MCP specification compliance

### Configuration Examples
- Cursor configuration example in README
- Workspace configuration template
- Deployment URL patterns

## 📚 Documentation

### Comprehensive Guides
- README with step-by-step setup
- Customization examples for tools, resources, prompts
- Troubleshooting section
- Integration guides for popular AI assistants

### Code Documentation
- Inline comments explaining key concepts
- Template sections for easy customization
- Example implementations with best practices
- Security notes and recommendations

This template provides everything needed to build, test, deploy, and maintain a production-ready MCP server on Adobe I/O Runtime.
