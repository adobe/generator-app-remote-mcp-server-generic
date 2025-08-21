# MCP Server on Adobe I/O Runtime Template

This is a template repository for creating [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers that run on Adobe I/O Runtime. MCP enables AI assistants like Cursor, Claude Desktop, and other AI tools to access your custom tools, resources, and prompts through a standardized protocol.

### ⚠️ Transport Compatibility

This server implementation supports **streamable HTTP transport only**. It is not compatible with legacy SSE-based MCP clients that use older protocol versions.

- ✅ Stateless HTTP responses: Handles single request-response cycles
- ✅ CORS support: Has proper CORS headers
- ✅ JSON-RPC compliance: Implements MCP protocol correctly

Future plans : 
- Authentication via OAuth2.0 
- streaming support: Cannot handle Server-Sent Events (SSE)
- session management: No session handling for now.
- bidirectional communication: Server cannot push notifications to clients

## 🚀 Quick Start

### Prerequisites

- Node.js 18.19.0 or higher
- [Adobe I/O CLI](https://developer.adobe.com/runtime/docs/guides/tools/cli_install/) installed
- An Adobe Developer Console project with I/O Runtime enabled

### 1. Use This Template

Click the **"Use this template"** button above to create your own repository from this template.

### 2. Clone and Setup

```bash
# Clone your new repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install
```

### 3. Configure Adobe I/O Runtime

1. Download your workspace configuration file from [Adobe Developer Console](https://developer.adobe.com/console)
2. Place the configuration file (e.g., `your-workspace-config.json`) in your project root
3. Configure the workspace:

```bash
aio app use your-workspace-config.json
```

### 4. Customize Your MCP Server

**First, update the server name and description:**
1. Replace `<%= projectName %>` with your server name in:
   - `package.json`
   - `actions/mcp-server/index.js` (SERVER_CONFIG)
   - `app.config.yaml`
2. Replace `<%= description %>` with your description in:
   - `package.json`
   - `actions/mcp-server/index.js` (SERVER_CONFIG)

**Then, customize functionality:**
Edit `actions/mcp-server/index.js` to add your custom tools, resources, and prompts:

- **Tools**: Interactive functions that AI assistants can call (currently includes `echo`, `calculator`, and `weather`)
- **Resources**: Static content like documentation, files, or data
- **Prompts**: Reusable prompt templates with parameters

### 5. Deploy to Adobe I/O Runtime

```bash
# Build and deploy
npm run deploy

# Or deploy with custom options
aio app deploy
```

### 6. Test Your MCP Server

Use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to test your server:

1. Get your deployed action URL from the deployment output
2. Open the MCP Inspector
3. Connect to your server URL
4. Test your tools, resources, and prompts

## 🛠️ Development

### Available Scripts

- `npm run build` - Build the project with webpack
- `npm run deploy` - Build and deploy to Adobe I/O Runtime
- `npm run undeploy` - Remove the deployment
- `npm run dev` - Run locally for development
- `npm test` - Run tests

### Local Development

```bash
# Run the server locally
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📖 Customization Guide

### Adding Tools

Tools are interactive functions that AI assistants can call. Add them to the `TOOLS_CACHE` object:

```javascript
const TOOLS_CACHE = {
    your_tool_name: {
        description: 'Description of what your tool does',
        parameters: {
            param1: {
                type: 'string',
                description: 'Description of parameter',
            },
            // Add more parameters as needed
        },
        handler: async (params) => {
            // Your tool logic here
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Your response here',
                    },
                ],
            }
        },
    },
}
```

### Adding Resources

Resources provide static content. Add them to the `RESOURCES_CACHE` object:

```javascript
const RESOURCES_CACHE = {
    'your://resource-uri': {
        name: 'Resource Name',
        description: 'Description of the resource',
        mimeType: 'text/plain',
        content: 'Your resource content here'
    }
}
```

### Adding Prompts

Prompts are reusable templates. Add them to the `PROMPTS_CACHE` object:

```javascript
const PROMPTS_CACHE = {
    your_prompt: {
        description: 'Description of your prompt',
        arguments: [
            {
                name: 'param_name',
                description: 'Parameter description',
                required: true
            }
        ],
        template: 'Your prompt template with {param_name} placeholders'
    }
}
```

## 🔧 Configuration

### Environment Variables

Configure your server behavior through the `app.config.yaml` file:

- `LOG_LEVEL`: Set logging level (debug, info, warn, error)
- `timeout`: Adjust function timeout (default: 300000ms)
- `memory`: Set memory limit (default: 512MB)

### CORS Configuration

The server includes CORS headers for cross-origin requests. Modify the `buildCommonHeaders()` function to customize CORS settings.

## 🔗 Integration with AI Assistants

### Cursor IDE

1. Deploy your MCP server
2. Add the server to your Cursor configuration ( use the url you recieve after deploying it )
3. Use your custom tools directly in Cursor

Example : 
```json
"<%= projectName %>": {
  "url": "https://your-workspace-name.adobeioruntime.net/api/v1/web/<%= projectName %>/mcp-server",
  "type": "streamable-http"
}
```

### Claude Desktop

1. Add your server URL to Claude Desktop's MCP configuration
2. Your tools and resources will be available in Claude conversations

### Other MCP Clients

Any MCP-compatible client can connect to your server using the deployed URL.

## 📚 Learn More

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/docs)
- [Adobe I/O Runtime Documentation](https://developer.adobe.com/runtime/docs/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This template is provided under the MIT License. See LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Deployment fails with authentication error:**
- Ensure your workspace configuration file is correct
- Verify your Adobe Developer Console project has I/O Runtime enabled

**MCP client can't connect:**
- Check that your server is deployed and accessible
- Verify the URL is correct
- Check CORS settings if connecting from a browser

**Tools not appearing:**
- Ensure tools are properly defined in `TOOLS_CACHE`
- Check server logs for initialization errors
- Verify JSON-RPC responses are properly formatted

### Getting Help

- Check the [Adobe I/O Runtime documentation](https://developer.adobe.com/runtime/docs/)
- Review [MCP documentation](https://modelcontextprotocol.io/docs)
- Open an issue in this repository for template-specific problems