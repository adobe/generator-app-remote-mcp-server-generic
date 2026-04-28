/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
 * Validate authentication token from request headers
 * Checks for Bearer token in Authorization header 
 */
function validateAuthToken (params) {
    const requiredToken = params.MCP_AUTH_TOKEN
    
    // If no token is configured, it is intentional ,skip authentication
    if (!requiredToken || requiredToken === 'your-secret-token-here') {
        logger?.warn('No authentication token configured - authentication disabled')
        return { isValid: true }
    }
    
    const headers = normalizeHeaders(params.__ow_headers)
    const authHeader = headers.authorization || headers.Authorization
    
    if (!authHeader) {
        return {
            isValid: false,
            error: 'Missing Authorization header'
        }
    }
    
    // Support both "Bearer <token>" and direct token
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader
    
    if (token !== requiredToken) {
        return {
            isValid: false,
            error: 'Invalid authentication token'
        }
    }
    
    return { isValid: true }
}

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
 * Normalize headers to lowercase keys for consistent lookup
 */
function normalizeHeaders (headers) {
    const normalized = {}
    if (headers) {
        for (const key in headers) {
            normalized[key.toLowerCase()] = headers[key]
        }
    }
    return normalized
}

/**
 * Create minimal req object compatible with StreamableHTTPServerTransport
 */
function createCompatibleRequest (params) {
    const body = parseRequestBody(params)

    // Normalize incoming headers to lowercase keys
    const incomingHeaders = normalizeHeaders(params.__ow_headers)

    // Log if client requested SSE (for debugging)
    if (incomingHeaders.accept && incomingHeaders.accept.includes('text/event-stream')) {
        logger?.info('Client requested SSE streaming, forcing JSON mode (serverless limitation)')
    }

    // Build headers with lowercase keys
    // SDK requires Accept header to include both application/json AND text/event-stream
    const headers = {
        'content-type': 'application/json',
        'mcp-session-id': params['mcp-session-id'] || incomingHeaders['mcp-session-id'],
        ...incomingHeaders,
        // SDK requires both content types - it will use enableJsonResponse to pick JSON mode
        'accept': 'application/json, text/event-stream'
    }

    return {
        method: (params.__ow_method || 'GET').toUpperCase(),
        url: params.__ow_path || '/mcp-server',
        path: params.__ow_path || '/mcp-server',
        headers,
        body,
        // Socket mock for streaming checks
        socket: {
            remoteAddress: '127.0.0.1',
            encrypted: true
        },
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
        status: code => { 
            statusCode = code
            res.statusCode = code
            return res 
        },
        setHeader: (name, value) => { headers[name] = value; return res },
        getHeader: name => headers[name],
        writeHead: (code, reasonOrHeaders, headerObj) => {
            statusCode = code
            res.statusCode = code
            // Handle both writeHead(code, headers) and writeHead(code, reason, headers)
            const hdrs = typeof reasonOrHeaders === 'object' ? reasonOrHeaders : (headerObj || {})
            headers = { ...headers, ...hdrs }
            headersSent = true
            return res
        },

        // Writing response
        write: chunk => {
            if (chunk) {
                body += typeof chunk === 'string' ? chunk : JSON.stringify(chunk)
            }
            return true
        },
        end: chunk => {
            if (chunk) {
                body += typeof chunk === 'string' ? chunk : JSON.stringify(chunk)
            }
            headersSent = true
            return res
        },
        json: obj => {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(obj)
            headersSent = true
            return res
        },
        send: data => {
            if (data) {
                body = typeof data === 'string' ? data : JSON.stringify(data)
            }
            headersSent = true
            return res
        },

        // Properties
        get headersSent () { return headersSent },
        get writableEnded () { return false },
        get writableFinished () { return false },
        get finished () { return false },
        get writable () { return true },
        statusCode: 200,
        
        // Socket mock (needed for streaming checks)
        socket: {
            writable: true,
            destroyed: false,
            on: () => {},
            once: () => {},
            removeListener: () => {},
            write: () => true,
            end: () => {}
        },
        connection: null,
        
        // Flush method
        flushHeaders: () => { headersSent = true },

        // Event emitter (minimal implementation)
        on: (event, handler) => { return res },
        once: (event, handler) => { return res },
        emit: (event, ...args) => { return true },
        removeListener: () => { return res },
        addListener: (event, handler) => { return res },
        off: (event, handler) => { return res },

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
 * Handle MCP requests using the SDK
 * Creates fresh server and transport instances per request (stateless pattern)
 */
async function handleMcpRequest (params) {
    const server = createMcpServer()

    try {
        logger?.info('Creating fresh MCP server and transport')

        // Create minimal compatible req/res objects
        const req = createCompatibleRequest(params)
        const res = createCompatibleResponse()

        logger?.info('Request method:', req.body?.method)

        // Create fresh transport for this request
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Stateless - no session tracking
            enableJsonResponse: true
        })

        // Connect server to transport
        await server.connect(transport)

        // Create a promise that resolves when the response is complete
        const responseComplete = new Promise(resolve => {
            const originalEnd = res.end.bind(res)
            res.end = function (chunk) {
                const result = originalEnd(chunk)
                setTimeout(() => resolve(), 10)
                return result
            }
        })

        // Let the SDK handle the request
        await transport.handleRequest(req, res, req.body)
        await responseComplete

        logger?.info('MCP request processed by SDK')
        return res.getResult()

    } catch (error) {
        logger?.error('Error in handleMcpRequest:', error)

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

        // Validate authentication token for all requests except OPTIONS (CORS preflight)
        if (params.__ow_method?.toLowerCase() !== 'options') {
            const authResult = validateAuthToken(params)
            if (!authResult.isValid) {
                logger.warn(`Authentication failed: ${authResult.error}`)
                return {
                    statusCode: 401,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                        'WWW-Authenticate': 'Bearer realm="MCP Server"'
                    },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32000,
                            message: `Authentication failed: ${authResult.error}`
                        },
                        id: null
                    })
                }
            }
            logger.info('Authentication successful')
        }

        // Route requests
        const incomingHeaders = normalizeHeaders(params.__ow_headers)
        
        switch (params.__ow_method?.toLowerCase()) {
        case 'get':
            // Check if client is requesting SSE stream
            // Return empty 200 response to gracefully indicate SSE is not available
            // This prevents error messages in MCP clients while allowing fallback to HTTP
            if (incomingHeaders.accept && incomingHeaders.accept.includes('text/event-stream')) {
                logger.info('SSE stream requested - not supported in serverless, returning graceful response')
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'close'
                    },
                    body: 'event: error\ndata: {"error": "SSE not supported in serverless. Use HTTP transport."}\n\n'
                }
            }
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
