# MCP Server Template Features

Production-ready Model Context Protocol (MCP) server template for Adobe I/O Runtime using the official **MCP TypeScript SDK v1.17.4**.

## 🔧 Core Implementation

- **MCP v2024-11-05** compliance with JSON-RPC 2.0
- **Streamable HTTP** transport for serverless environments  
- **Official MCP SDK** integration with type-safe Zod schemas
- **Full capabilities**: Tools, Resources, Prompts, and Logging

## 🛠️ Built-in Tools

### Echo Tool
Test connectivity and debugging with message echo functionality.

### Calculator Tool  
Mathematical expression evaluation with configurable output formats (decimal, scientific, fraction).
**Note**: Uses `eval()` - replace with proper math parser for production.

### Weather Tool (MyWeather)
Mock weather API demonstrating external service integration patterns. Ready for real API replacement.

## 📚 Resources & Prompts

**Resources**: Example text content, API documentation (Markdown), and configuration schemas (JSON)

**Prompts**: Weather information prompt with optional city parameter and dynamic templating

## 🚀 Development Stack

- **Build**: Webpack + Babel for Node.js 18+ 
- **Testing**: Jest with full coverage and Adobe I/O mocks
- **Quality**: ESLint + Prettier with security rules
- **Deployment**: Adobe I/O CLI integration

## 📁 Project Structure

```
your-mcp-server/
├── actions/mcp-server/
│   ├── index.js          # Main MCP server (SDK-powered)
│   └── tools.js          # Tool definitions  
├── test/                 # Jest test suite
├── app.config.yaml       # I/O Runtime config
├── package.json          # Dependencies (includes MCP SDK)
└── webpack.config.js     # Build configuration
```

## 🔄 Quick Start

```bash
npm install         # Install dependencies  
npm run dev         # Local development
npm test           # Run tests
npm run deploy     # Deploy to I/O Runtime
```

## 🎯 Customization

**Adding Tools**: Extend `registerTools()` in `tools.js` using `server.tool()` with Zod schemas

**Adding Resources**: Use `server.resource()` for static content access

**Adding Prompts**: Use `server.prompt()` for reusable templates

## 🔐 Security & Performance

- **Serverless optimized**: Stateless design with global caches
- **CORS enabled**: Ready for browser clients
- **Input validation**: Zod schema enforcement
- **Monitoring**: Adobe I/O Logger integration

## 🤝 AI Assistant Ready

Compatible with Cursor IDE, Claude Desktop, and any MCP-compliant client via latest Streamable HTTP transport.

All implemented using the official MCP TypeScript SDK with type-safe Zod schemas.
