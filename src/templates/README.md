# MCP Server on Adobe I/O Runtime Template

Create [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers for Adobe I/O Runtime using the **official MCP TypeScript SDK**. Connect AI assistants like Cursor and Claude Desktop to your custom tools, resources, and prompts.

This Project is generated using https://github.com/OneAdobe/app-builder-remote-mcp-server-starter template.

## Authentication

The MCP server supports two authentication modes to secure your endpoints:

### IMS Token Validation (Adobe Users)

Set `AUTH_VALIDATE_IMS=true` to validate Bearer tokens via Adobe IMS userinfo endpoint. This is ideal for Adobe employee or partner authentication.

**Configuration:**

```bash
# In .env or workspace config
AUTH_VALIDATE_IMS=true
```

**Cursor Configuration:**

```json
{
  "mcpServers": {
    "my-mcp": {
      "url": "https://namespace.adobeioruntime.net/api/v1/web/pkg/mcp-server",
      "type": "streamable-http",
      "headers": {
        "Authorization": "Bearer YOUR_IMS_TOKEN"
      }
    }
  }
}
```

**Claude Desktop Configuration:**

```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://namespace.adobeioruntime.net/api/v1/web/pkg/mcp-server",
        "--header",
        "Authorization:${IMS_TOKEN}"
      ],
      "env": {
        "IMS_TOKEN": "Bearer YOUR_IMS_TOKEN"
      }
    }
  }
}
```

**Note:** Claude Desktop on Windows has a bug with spaces in args. Use `Authorization:${IMS_TOKEN}` (no space after colon) and put the full `Bearer YOUR_IMS_TOKEN` in the env variable.

### API Key Authentication (Service-to-Service)

Set `SERVICE_API_KEY` for simple key-based authentication. This is ideal for service-to-service communication or custom client applications.

**Configuration:**

```bash
# In .env or workspace config
SERVICE_API_KEY=your-secret-key-here
```

The client must send the API key in either the `Authorization` header or `x-api-key` header:

```bash
# Using Authorization header
curl -H "Authorization: Bearer your-secret-key-here" \
  https://namespace.adobeioruntime.net/api/v1/web/pkg/mcp-server

# Using x-api-key header
curl -H "x-api-key: your-secret-key-here" \
  https://namespace.adobeioruntime.net/api/v1/web/pkg/mcp-server
```

**Cursor Configuration:**

```json
{
  "mcpServers": {
    "my-mcp": {
      "url": "https://namespace.adobeioruntime.net/api/v1/web/pkg/mcp-server",
      "type": "streamable-http",
      "headers": {
        "x-api-key": "your-secret-key-here"
      }
    }
  }
}
```

**Claude Desktop Configuration:**

```json
{
  "mcpServers": {
    "my-mcp": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://namespace.adobeioruntime.net/api/v1/web/pkg/mcp-server",
        "--header",
        "x-api-key:${API_KEY}"
      ],
      "env": {
        "API_KEY": "your-secret-key-here"
      }
    }
  }
}
```

### No Authentication (Development Only)

Leave both variables unset for open access (not recommended for production).

**Security Note:** Always use authentication in production deployments. Generate strong random values for `SERVICE_API_KEY` and never commit secrets to version control. 