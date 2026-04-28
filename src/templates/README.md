# MCP Server on Adobe I/O Runtime Template

Create [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers for Adobe I/O Runtime using the **official MCP TypeScript SDK**. Connect AI assistants like Cursor and Claude Desktop to your custom tools, resources, and prompts.

This Project is generated using [https://github.com/adobe/generator-app-remote-mcp-server-generic](https://github.com/adobe/generator-app-remote-mcp-server-generic) template.

## Authentication

This MCP server includes optional token-based authentication to secure your endpoints.

### Enabling Authentication

1. **Add token to `.env` file:**
  ```bash
   # Generate a secure token
   node -e "console.log(require('crypto').randomUUID())"

   # Add to .env
   MCP_AUTH_TOKEN=your-generated-token-here
  ```
2. **Deploy your application:**
  ```bash
   aio app deploy
  ```
3. **Configure your MCP client** with the token in headers:
  ```json
   {
     "mcpServers": {
       "<%= projectName %>": {
         "url": "https://your-runtime-url.adobeioruntime.net/api/v1/web/<%= projectName %>/mcp-server",
         "type": "streamable-http",
         "headers": {
           "Authorization": "Bearer your-generated-token-here"
         }
       }
     }
   }
  ```

### How It Works

- If `MCP_AUTH_TOKEN` is set in `.env`, all requests (except CORS OPTIONS) require authentication
- If `MCP_AUTH_TOKEN` is not set or left as default, authentication is disabled
- Tokens can be sent as `Bearer <token>` or directly in the Authorization header
- Failed authentication returns 401 Unauthorized

### Disabling Authentication

For development or testing, leave `MCP_AUTH_TOKEN` unset or use the default value:

```bash
MCP_AUTH_TOKEN=your-secret-token-here
```

**⚠️ Warning**: Always enable authentication for production deployments!