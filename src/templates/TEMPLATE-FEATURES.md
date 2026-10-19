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

### Weather Tool 
Mock weather API demonstrating external service integration patterns. Ready for real API replacement.
Also demonstrates MCP App UI: the result links to a `ui://weather/mcp-app.html` resource so
MCP Apps-capable hosts render a themed, animated weather card instead of plain text (see
`actions/mcp-server/app-ui/src/weather/`).

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
│   ├── tools.js          # Tool definitions
│   ├── app-ui/src/       # MCP App UI source (HTML/CSS/TS, built with Vite)
│   └── static/           # Built UI HTML (generated, gitignored)
├── scripts/              # build-ui.js / embed-ui.js (UI build pipeline)
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
npm run build      # Build UI + bundle (build:ui, embed:ui, webpack)
npm run deploy     # Deploy to I/O Runtime
```

## 🎯 Customization

**Adding Tools**: Extend `registerTools()` in `tools.js` using `server.tool()` with Zod schemas

**Adding Resources**: Use `server.resource()` for static content access

**Adding Prompts**: Use `server.prompt()` for reusable templates

**Adding a Tool UI**: Drop a new `app-ui/src/<name>/<name>.{html,ts,css}`, link a tool's result to
it via `_meta.ui.resourceUri`, and register a matching resource - `npm run build:ui`/`embed:ui` pick
it up automatically (see the `weather` tool for a working example)

## 🔐 Security & Performance

- **Serverless optimized**: Stateless design with global caches
- **CORS enabled**: Ready for browser clients
- **Input validation**: Zod schema enforcement
- **Monitoring**: Adobe I/O Logger integration

## 🤝 AI Assistant Ready

Compatible with Cursor IDE, Claude Desktop, and any MCP-compliant client via latest Streamable HTTP transport.

All implemented using the official MCP TypeScript SDK with type-safe Zod schemas.
