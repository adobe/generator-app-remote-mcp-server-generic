/**
 * MCP Server for Adobe I/O Runtime - With MCP SDK Implementation
 *
 * Following the exact pattern from TypeScript SDK examples but adapted for Adobe I/O Runtime.
 * Uses the stateless pattern where fresh server and transport instances are created per request.
 */

const { Core } = require('@adobe/aio-sdk')
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js')
const { registerTools, registerResources, registerPrompts } = require('./tools.js')

// Global logger variable
let logger = null

/**
 * Create MCP server instance with all capabilities
 * Following the exact pattern from SDK examples
 */
function createMcpServer () {
    const server = new McpServer({
    name: '<%= projectName %>',
        version: '1.0.0'
    }, {
        capabilities: {
            logging: {},
            tools: {},
            resources: {},
            prompts: {}
        }
    })

    // Register all capabilities
    registerTools(server)
    registerResources(server)
    registerPrompts(server)

            if (logger) {
        logger.info('MCP Server created with tools, resources, prompts, and logging capabilities')
    }

    return server
}

/**
 * Parse request body from Adobe I/O Runtime parameters
 */
function parseRequestBody (params) {
    if (!params.__ow_body) {
        return null
    }

    try {
        if (typeof params.__ow_body === 'string') {
            // Try base64 decode first, then direct parse
            try {
                const decoded = Buffer.from(params.__ow_body, 'base64').toString('utf8')
                return JSON.parse(decoded)
            } catch (e) {
                return JSON.parse(params.__ow_body)
            }
        } else {
            return params.__ow_body
        }
    } catch (error) {
        logger?.error('Failed to parse request body:', error)
        throw new Error(`Failed to parse request body: ${error.message}`)
    }
}

/**
 * Create minimal req object compatible with StreamableHTTPServerTransport
 */
function createCompatibleRequest (params) {
    const body = parseRequestBody(params)

        return {
        method: (params.__ow_method || 'GET').toUpperCase(),
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json, text/event-stream',
            'mcp-session-id': params['mcp-session-id'] || params.__ow_headers?.['mcp-session-id'],
            ...(params.__ow_headers || {})
        },
        body,
        get (name) {
            return this.headers[name.toLowerCase()]
        }
    }
}

/**
 * Create minimal res object compatible with StreamableHTTPServerTransport
 */
function createCompatibleResponse () {
    let statusCode = 200
    let headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, x-api-key, mcp-session-id, Last-Event-ID',
        'Access-Control-Expose-Headers': 'Content-Type, mcp-session-id, Last-Event-ID',
        'Access-Control-Max-Age': '86400'
    }
    let body = ''
    let headersSent = false

    const res = {
    // Status and headers
        status: code => { statusCode = code; return res },
        setHeader: (name, value) => { headers[name] = value; return res },
        getHeader: name => headers[name],
        writeHead: (code, headerObj = {}) => {
            statusCode = code
            headers = { ...headers, ...headerObj }
            headersSent = true
            return res
        },

        // Writing response
        write: chunk => {
            if (chunk) {
                body += typeof chunk === 'string' ? chunk : JSON.stringify(chunk)
                logger?.info('Response write called with chunk length:', String(chunk).length)
            }
            return true
        },
        end: chunk => {
            if (chunk) {
                body += typeof chunk === 'string' ? chunk : JSON.stringify(chunk)
                logger?.info('Response end called with chunk length:', String(chunk).length)
            }
            headersSent = true
            return res
        },
        json: obj => {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(obj)
            headersSent = true
            logger?.info('Response json called with object:', JSON.stringify(obj).substring(0, 200))
            return res
        },
        send: data => {
            if (data) {
                body = typeof data === 'string' ? data : JSON.stringify(data)
                logger?.info('Response send called with data length:', String(data).length)
            }
            headersSent = true
            return res
        },

        // Properties
        get headersSent () { return headersSent },

        // Event emitter (minimal implementation)
        on: () => {},
        emit: () => {},
        removeListener: () => {},

        // Get result for Adobe I/O Runtime
        getResult: () => {
            logger?.info('Final response - Status:', statusCode, 'Body length:', body.length, 'Headers:', Object.keys(headers).join(', '))
            return { statusCode, headers, body }
        }
    }

    return res
}

/**
 * Handle health check requests
 */
function handleHealthCheck () {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, x-api-key, mcp-session-id, Last-Event-ID',
            'Access-Control-Expose-Headers': 'Content-Type, mcp-session-id, Last-Event-ID',
            'Access-Control-Max-Age': '86400',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'healthy',
            server: '<%= projectName %>',
            version: '1.0.0',
            description: 'Adobe I/O Runtime MCP Server using official TypeScript SDK v1.17.4',
            timestamp: new Date().toISOString(),
            transport: 'StreamableHTTP',
            sdk: '@modelcontextprotocol/sdk'
        })
    }
}

/**
 * Handle CORS OPTIONS requests
 */
function handleOptionsRequest () {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, x-api-key, mcp-session-id, Last-Event-ID',
            'Access-Control-Expose-Headers': 'Content-Type, mcp-session-id, Last-Event-ID',
            'Access-Control-Max-Age': '86400'
        },
        body: ''
    }
}

/**
 * Handle MCP requests using the SDK - following the exact stateless pattern
 */
async function handleMcpRequest (params) {
    // Following the exact pattern from simpleStatelessStreamableHttp.ts
    const server = createMcpServer()

    try {
        logger?.info('Creating fresh MCP server and transport (stateless pattern)')

        // Create minimal compatible req/res objects
        const req = createCompatibleRequest(params)
        const res = createCompatibleResponse()

        // Create fresh transport for this request (stateless)
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Let SDK manage sessions
            enableJsonResponse: true, // Enable JSON response mode for MCP Inspector compatibility
        })

        // Connect server to transport
        await server.connect(transport)

        // Create a promise that resolves when the response is complete
        const responseComplete = new Promise(resolve => {
            // Override the end method to know when response is done
            const originalEnd = res.end.bind(res)
            res.end = function (chunk) {
                const result = originalEnd(chunk)
                // Give a small delay to ensure all writes are captured
                setTimeout(() => resolve(), 10)
                return result
            }
        })

        // Let the SDK handle everything - this is the key line!
        await transport.handleRequest(req, res, req.body)

        // Wait for the response to be complete
        await responseComplete

        // Cleanup (following the pattern from examples)
        res.on('close', () => {
            logger?.info('Request closed, cleaning up')
            transport.close()
            server.close()
        })

        logger?.info('MCP request processed by SDK')

        // Return Adobe I/O Runtime response
        return res.getResult()

            } catch (error) {
        logger?.error('Error in handleMcpRequest:', error)

        // Cleanup on error
        try {
            server.close()
        } catch (cleanupError) {
            logger?.error('Error during cleanup:', cleanupError)
        }

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: `Internal server error: ${error.message}`
                },
                id: null
            })
        }
    }
}

/**
 * Main function for Adobe I/O Runtime
 */
async function main (params) {
    try {
        console.log('=== MCP SERVER (CLEAN SDK IMPLEMENTATION) ===')
        console.log('Method:', params.__ow_method)

        // Initialize logger
        try {
            logger = Core.Logger('<%= projectName %>', { level: params.LOG_LEVEL || 'info' })
        } catch (loggerError) {
            console.error('Logger creation error:', loggerError)
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Logger creation error: ${loggerError.message}` })
            }
        }

        logger.info('MCP Server using official TypeScript SDK v1.17.4')
        logger.info(`Request method: ${params.__ow_method}`)

        // Route requests
        switch (params.__ow_method?.toLowerCase()) {
        case 'get':
            logger.info('Health check request')
            return handleHealthCheck()

        case 'options':
            logger.info('CORS preflight request')
            return handleOptionsRequest()

        case 'post':
            logger.info('MCP protocol request - delegating to SDK')
            return await handleMcpRequest(params)

        default:
            logger.warn(`Method not allowed: ${params.__ow_method}`)
        return {
            statusCode: 405,
            headers: {
                    'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                        code: -32000,
                        message: `Method '${params.__ow_method}' not allowed. Supported: GET, POST, OPTIONS`
                },
                id: null
            })
        }
        }

    } catch (error) {
        if (logger) {
            logger.error('Uncaught error in main function:', error)
        } else {
            console.error('Uncaught error in main function:', error)
        }

        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: `Unhandled server error: ${error.message}`
                },
                id: null
            })
        }
    }
}

// Export for Adobe I/O Runtime
module.exports = { main }
