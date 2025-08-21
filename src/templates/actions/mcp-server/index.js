/**
 * MCP Server Template for Adobe I/O Runtime
 *
 * This template implements a Model Context Protocol (MCP) server that runs on Adobe I/O Runtime.
 * It provides a complete foundation for building custom MCP servers that can integrate with
 * AI assistants like Cursor, Claude Desktop, and other MCP-compatible clients.
 *
 * Key Features:
 * - Full MCP protocol compliance (v2024-11-05)
 * - Stateless design optimized for serverless environments
 * - CORS support for browser-based clients
 * - Comprehensive error handling and logging
 * - Example tools, resources, and prompts for quick start
 * 
 * Customization Guide:
 * 1. Modify TOOLS_CACHE to add your custom tools
 * 2. Update RESOURCES_CACHE for static content and data
 * 3. Enhance PROMPTS_CACHE with reusable prompt templates
 * 4. Adjust SERVER_CONFIG for your server information
 *
 * Available Tools (modify as needed):
 * - echo: Echo back input messages for testing connectivity
 * - calculator: Perform basic mathematical calculations
 * - weather: Get current weather data for any city (mock data with API call example)
 *
 * Resources (modify as needed):
 * - example://resource1: Sample static resource
 * - docs://api: Example API documentation resource
 *
 * Prompts (modify as needed):
 * - weather_info: Prompt template for weather API integration guidance
 * 
 * 
 */

const { Core } = require('@adobe/aio-sdk')

// Global logger variable - will be initialized by the wrapper
let logger = null

// Server configuration - customize this for your MCP server
const SERVER_CONFIG = {
    name: '<%= projectName %>',
    version: '1.0.0',
    description: '<%= description %>',
}

// Store registered tools in a global cache for serverless environment
// This ensures tools persist between stateless invocations
// 
// CUSTOMIZATION: Add your custom tools here following the same pattern
const TOOLS_CACHE = {
    // Basic echo tool for testing connectivity
    echo: {
        description: 'A simple utility tool that echoes back the input message. Useful for testing connectivity, debugging, or confirming that the MCP server is responding correctly to requests.',
        parameters: {
            message: {
                type: 'string',
                description: 'The message you want to echo back - useful for testing and debugging',
            },
        },
        handler: async (params) => {
            const message = params.message || 'No message provided'
            return {
                content: [
                    {
                        type: 'text',
                        text: `Echo: ${message}`,
                    },
                ],
            }
        },
    },



    // Example calculation tool
    calculator: {
        description: 'Perform basic mathematical calculations. Supports arithmetic operations and common mathematical functions.',
        parameters: {
            expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate (e.g., "2 + 3 * 4", "sqrt(16)", "sin(30)")',
            },
            format: {
                type: 'string',
                enum: ['decimal', 'scientific', 'fraction'],
                description: 'Number format for the result (default: decimal)'
            }
        },
        handler: async (params) => {
            const expression = params.expression || ''
            const format = params.format || 'decimal'
            
            if (logger) {
                logger.info(`Calculator called with expression: ${expression}`)
            }
            
            try {
                // CUSTOMIZE: Replace with your preferred math library
                // This is a simple example - consider using a proper math parser for production
                const sanitizedExpression = expression.replace(/[^0-9+\-*/().\s]/g, '')
                
                // Basic validation
                if (!sanitizedExpression) {
                    throw new Error('Invalid expression')
                }
                
                // WARNING: eval() is dangerous - use a proper math parser in production
                // eslint-disable-next-line no-eval
                const result = eval(sanitizedExpression)
                
                let formattedResult
                switch (format) {
                case 'scientific':
                    formattedResult = result.toExponential(6)
                    break
                case 'fraction':
                    // Simple fraction approximation
                    formattedResult = `≈ ${result.toFixed(6)}`
                    break
                default:
                    formattedResult = result.toString()
                }
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🧮 Calculation Result:\n\nExpression: ${expression}\nResult: ${formattedResult}`,
                        },
                    ],
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Calculation Error:\n\nExpression: ${expression}\nError: ${error.message}\n\nPlease check your expression and try again.`,
                        },
                    ],
                }
            }
        },
    },

    // Example weather API tool - demonstrates external API calls
    weather: {
        description: 'Get current weather information for any city. This tool demonstrates how to integrate with external APIs and handle real-time data.',
        parameters: {
            city: {
                type: 'string',
                description: 'Name of the city to get weather for (e.g., "San Francisco", "New York", "London")',
            }
        },
        handler: async (params) => {
            const city = params.city || 'Unknown City'
            
            if (logger) {
                logger.info(`Weather request for ${city}`)
            }
            
            try {
                // CUSTOMIZE: Replace this section with actual API calls
                // Example API integrations:
                // 
                //
                // For now, we'll return realistic mock data with random variations
                
                // Generate realistic spring weather with random variations (always in Celsius)
                const baseTemp = 18 // Spring baseline in Celsius
                const tempVariation = (Math.random() - 0.5) * 20 // ±10 degrees variation
                const temperature = Math.round((baseTemp + tempVariation) * 10) / 10
                
                const conditions = [
                    'Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 
                    'Scattered Showers', 'Clear', 'Overcast', 'Drizzle'
                ]
                const currentCondition = conditions[Math.floor(Math.random() * conditions.length)]
                
                const humidity = Math.floor(Math.random() * 40) + 40 // 40-80%
                const windSpeed = Math.floor(Math.random() * 15) + 5 // 5-20 km/h
                const pressure = Math.floor(Math.random() * 30) + 1000 // 1000-1030 hPa
                
                // Create realistic weather response
                const weatherData = {
                    city: city,
                    country: 'Sample Country', // In real API, this would come from the response
                    current: {
                        temperature: temperature,
                        condition: currentCondition,
                        humidity: `${humidity}%`,
                        wind_speed: `${windSpeed} km/h`,
                        pressure: `${pressure} hPa`,
                        visibility: `${Math.floor(Math.random() * 5) + 10} km`,
                        uv_index: Math.floor(Math.random() * 8) + 1
                    },
                    last_updated: new Date().toISOString(),
                    source: 'Mock Weather Service (replace with real API)'
                }
                
                // Format response for display
                let responseText = `🌤️ Weather for ${city}\n`
                responseText += '⚠️ **EXAMPLE DATA - NOT REAL WEATHER** ⚠️\n\n'
                responseText += `🌡️ Temperature: ${temperature}°C\n`
                responseText += `☁️ Conditions: ${currentCondition}\n`
                responseText += `💧 Humidity: ${humidity}%\n`
                responseText += `💨 Wind: ${windSpeed} km/h\n`
                responseText += `📊 Pressure: ${pressure} hPa\n`
                responseText += `👁️ Visibility: ${weatherData.current.visibility}\n`
                responseText += `☀️ UV Index: ${weatherData.current.uv_index}\n`
                responseText += `\n⏰ Last Updated: ${new Date().toLocaleString()}`
                responseText += '\n\n💡 Note: This is mock/example data for demonstration purposes only. Replace with real weather API calls in production.'
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: responseText,
                        },
                    ],
                    // Optional: Include structured data
                    metadata: {
                        source: 'mock-weather-service',
                        city: city,
                        timestamp: new Date().toISOString(),
                        raw_data: weatherData
                    }
                }
                
            } catch (error) {
                if (logger) {
                    logger.error(`Weather API error: ${error.message}`)
                }
                
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Weather Error: Unable to fetch weather data for ${city}.\n\nError: ${error.message}\n\nThis could happen due to:\n- Invalid city name\n- API service unavailable\n- Network connectivity issues\n- API rate limiting\n\nPlease try again with a valid city name.`,
                        },
                    ],
                }
            }
        },
    },

    // TEMPLATE FOR NEW TOOLS:
    // Copy this template and customize for your needs
    /*
    your_tool_name: {
        description: 'Describe what your tool does and when to use it',
        parameters: {
            param1: {
                type: 'string', // string, number, boolean, object, array
                description: 'Description of this parameter',
                // Optional: enum: ['option1', 'option2'] for predefined values
            },
            param2: {
                type: 'object',
                properties: {
                    nested_param: {
                        type: 'string',
                        description: 'Nested parameter description'
                    }
                },
                description: 'Object parameter with nested properties'
            }
        },
        handler: async (params) => {
            // Your tool logic here
            const result = await yourCustomLogic(params)
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `Your response: ${result}`,
                    },
                ],
                // Optional: Add metadata
                // metadata: { source: 'your-tool', timestamp: new Date().toISOString() }
            }
        },
    },
    */
}

// Pre-defined resources cache
// Resources provide static content that AI assistants can access
// CUSTOMIZATION: Add your resources here (documentation, data, files, etc.)
const RESOURCES_CACHE = {
    'example://resource1': {
        name: 'Example Resource 1',
        description: 'A sample text resource for demonstration purposes',
        mimeType: 'text/plain',
        content: 'This is the content of example resource 1. It demonstrates how resources work in the MCP protocol. Resources can contain documentation, reference data, configuration files, or any static content your AI assistant might need.'
    },

    'docs://api': {
        name: 'API Documentation',
        description: 'Example API documentation resource',
        mimeType: 'text/markdown',
        content: `# API Documentation

## Overview
This is example API documentation that demonstrates how to provide structured information through MCP resources.

## Endpoints

### GET /api/users
Returns a list of users.

**Response:**
\`\`\`json
{
  "users": [
    {"id": 1, "name": "John Doe", "email": "john@example.com"}
  ]
}
\`\`\`

### POST /api/users
Creates a new user.

**Request Body:**
\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\`

CUSTOMIZE: Replace this with your actual API documentation, database schemas, or any reference material.`
    },

    'config://settings': {
        name: 'Configuration Settings',
        description: 'Example configuration and settings reference',
        mimeType: 'application/json',
        content: JSON.stringify({
            server: {
                name: 'my-mcp-server',
                version: '1.0.0',
                environment: 'production'
            },
            features: {
                tools_enabled: true,
                resources_enabled: true,
                prompts_enabled: true
            },
            limits: {
                max_response_size: '1MB',
                timeout: '30s'
            },
            note: 'CUSTOMIZE: Replace with your actual configuration schema'
        }, null, 2)
    }

    // TEMPLATE FOR NEW RESOURCES:
    // Add more resources following this pattern
    /*
    'your://custom-resource': {
        name: 'Your Resource Name',
        description: 'Description of what this resource contains',
        mimeType: 'text/plain', // or 'application/json', 'text/markdown', etc.
        content: 'Your resource content here...'
    }
    */
}

// Pre-defined prompts cache
// Prompts are reusable templates that AI assistants can use
// CUSTOMIZATION: Add your prompt templates here
const PROMPTS_CACHE = {
    weather_info: {
        description: 'Simple prompt to explain the weather tool functionality',
        arguments: [
            {
                name: 'city',
                description: 'City name to use in the example',
                required: false
            }
        ],
        template: `Explain how the weather tool works in this MCP server.

Example city: {city}

The weather tool:
- Takes a city name as input
- Returns current weather information
- Shows temperature, conditions, humidity, wind, and other details
- Currently uses mock/example data for demonstration
- Can be replaced with real weather API calls for production use

Note: This is a demonstration tool that shows how to build weather functionality in an MCP server.`
    }

    // TEMPLATE FOR NEW PROMPTS:
    // Add more prompts following this pattern
    /*
    your_prompt_name: {
        description: 'Description of what this prompt helps with',
        arguments: [
            {
                name: 'param1',
                description: 'Description of this parameter',
                required: true // or false
            },
            {
                name: 'param2',
                description: 'Description of optional parameter',
                required: false
            }
        ],
        template: 'Your prompt template here. Use {param1} and {param2} placeholders for dynamic content.'
    }
    */
}

/**
 * Initialize MCP server capabilities - simplified for I/O Runtime
 */
async function initializeMcpCapabilities() {
    try {
        // Check if logger is available
        if (!logger) {
            console.error('Logger not initialized in initializeMcpCapabilities')
            throw new Error('Logger not available')
        }
        
        logger.info('=== INITIALIZING MCP CAPABILITIES ===')
        logger.info(`Available tools: ${Object.keys(TOOLS_CACHE).join(', ')}`)
        logger.info(`Available resources: ${Object.keys(RESOURCES_CACHE).join(', ')}`)
        logger.info(`Available prompts: ${Object.keys(PROMPTS_CACHE).join(', ')}`)
        
        return {
            tools: TOOLS_CACHE,
            resources: RESOURCES_CACHE,
            prompts: PROMPTS_CACHE
        }
    } catch (error) {
        logger.error('Error initializing MCP capabilities:', error)
        throw error
    }
}

/**
 * Build common headers for CORS and other necessary information
 */
function buildCommonHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, x-api-key, mcp-session-id, Last-Event-ID',
        'Access-Control-Expose-Headers': 'Content-Type, mcp-session-id, Last-Event-ID',
        'Access-Control-Max-Age': '86400',
    }
}

/**
 * Parse the request body from Adobe I/O Runtime parameters
 */
function parseRequestBody(params) {
    try {
        logger.info('Parsing request body type:', typeof params.__ow_body)

        if (!params.__ow_body) {
            logger.error('Request body is empty')
            return null
        }

        let parsedBody

        // Check if body is base64 encoded
        if (typeof params.__ow_body === 'string' && /^[A-Za-z0-9+/=]+$/.test(params.__ow_body)) {
            try {
                const decodedBody = Buffer.from(params.__ow_body, 'base64').toString('utf8')
                logger.info('Decoded base64 body (first 100 chars):', decodedBody.substring(0, 100))
                parsedBody = JSON.parse(decodedBody)
                logger.info('Successfully parsed base64-encoded JSON body')
            } catch (e) {
                logger.error('Failed to parse base64 body:', e)
                // Try parsing as a regular string
                parsedBody = JSON.parse(params.__ow_body)
                logger.info('Successfully parsed direct JSON body (after base64 decode failed)')
            }
        }
        // Handle string body
        else if (typeof params.__ow_body === 'string') {
            logger.info('String body (first 100 chars):', params.__ow_body.substring(0, 100))
            parsedBody = JSON.parse(params.__ow_body)
            logger.info('Successfully parsed string JSON body')
        }
        // Handle object body
        else if (typeof params.__ow_body === 'object') {
            parsedBody = params.__ow_body
            logger.info('Body is already an object')
        } else {
            throw new Error(`Unknown body type: ${typeof params.__ow_body}`)
        }

        return parsedBody
    } catch (error) {
        logger.error('Error parsing request body:', error)
        logger.error('Body type:', typeof params.__ow_body)
        logger.error('Body (first 200 chars):', String(params.__ow_body).substring(0, 200))
        throw new Error(`Failed to parse request body: ${error.message}`)
    }
}

/**
 * Handle health check requests
 */
function handleHealthCheck() {
    logger.info('Health check requested')
    return {
        statusCode: 200,
        headers: {
            ...buildCommonHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: 'healthy',
            server: SERVER_CONFIG.name,
            version: SERVER_CONFIG.version,
            timestamp: new Date().toISOString(),
        }),
    }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function handleOptionsRequest() {
    logger.info('OPTIONS preflight request')
    return {
        statusCode: 200,
        headers: buildCommonHeaders(),
        body: '',
    }
}

/**
 * Handle MCP JSON-RPC requests
 */
async function handleMcpRequest(params) {
    try {
        logger.info('=== HANDLING MCP REQUEST ===')
        
        // Parse the request body
        const requestBody = parseRequestBody(params)
        
        if (!requestBody) {
            logger.error('Empty request body')
            return {
                statusCode: 400,
                headers: buildCommonHeaders(),
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32600,
                        message: 'Invalid Request - empty body',
                    },
                    id: null,
                }),
            }
        }

        logger.info('Request method:', requestBody.method)
        logger.info('Request ID:', requestBody.id)

        // Initialize MCP capabilities - mandatory for latest clients like Cursor to work
        await initializeMcpCapabilities()

        // Handle initialize method
        if (requestBody.method === 'initialize') {
            logger.info('=== initialize HANDLER ===')
            
            const responseBody = {
                jsonrpc: '2.0',
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        tools: {
                            maxConcurrentCalls: 1,
                        },
                        resources: {},
                        prompts: {},
                        logging: {}
                    },
                    serverInfo: {
                        name: SERVER_CONFIG.name,
                        version: SERVER_CONFIG.version,
                        description: SERVER_CONFIG.description
                    }
                },
                id: requestBody.id,
            }

            logger.info('=== initialize HANDLER COMPLETED ===')

            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responseBody),
            }
        }

        // Handle notifications/initialized method that Cursor expects
        if (requestBody.method === 'notifications/initialized') {
            logger.info('=== notifications/initialized HANDLER ===')
            logger.info('Processing notifications/initialized request from client (Cursor)')
            // This is a notification from the client indicating it's ready
            // We just need to acknowledge it with an empty result
            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    result: {},
                    id: requestBody.id,
                }),
            }
        }

        // Handle tools/list method
        if (requestBody.method === 'tools/list') {
            logger.info('=== tools/list HANDLER ===')
            
            try {
                const tools = []

                // Build tools from cache
                for (const [name, tool] of Object.entries(TOOLS_CACHE)) {
                    if (tool && typeof tool === 'object') {
                        tools.push({
                            name,
                            description: tool.description || 'No description available',
                            inputSchema: {
                                type: 'object',
                                properties: tool.parameters || {},
                                required: [],
                            },
                        })
                    }
                }

                logger.info('Final tools count:', tools.length)

                const responseBody = {
                    jsonrpc: '2.0',
                    result: { tools },
                    id: requestBody.id,
                }

                return {
                    statusCode: 200,
                    headers: {
                        ...buildCommonHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(responseBody),
                }
            } catch (error) {
                logger.error('Error in tools/list handler:', error)
                return {
                    statusCode: 500,
                    headers: buildCommonHeaders(),
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: `Error handling tools/list: ${error.message}`,
                        },
                        id: requestBody.id,
                    }),
                }
            }
        }

        // Handle tools/call method
        if (requestBody.method === 'tools/call') {
            logger.info('=== tools/call HANDLER ===')
            
            try {
                const toolName = requestBody.params?.name
                const toolArgs = requestBody.params?.arguments || {}

                logger.info(`Tool call request for "${toolName}"`)

                // Find the tool in cache
                const tool = TOOLS_CACHE[toolName]
                
                if (!tool) {
                    logger.error(`Tool "${toolName}" not found`)
                    return {
                        statusCode: 404,
                        headers: buildCommonHeaders(),
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            error: {
                                code: -32601,
                                message: `Tool '${toolName}' not found`,
                            },
                            id: requestBody.id,
                        }),
                    }
                }

                logger.info(`Executing tool "${toolName}"`)
                
                // Execute the tool handler
                const result = await tool.handler(toolArgs)
                
                logger.info(`Tool "${toolName}" executed successfully`)

                const responseBody = {
                    jsonrpc: '2.0',
                    result,
                    id: requestBody.id,
                }

                return {
                    statusCode: 200,
                    headers: {
                        ...buildCommonHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(responseBody),
                }
            } catch (error) {
                logger.error('Error in tools/call handler:', error)
                return {
                    statusCode: 500,
                    headers: buildCommonHeaders(),
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32603,
                            message: `Error executing tool: ${error.message}`,
                        },
                        id: requestBody.id,
                    }),
                }
            }
        }

        // Handle resources/list method
        if (requestBody.method === 'resources/list') {
            logger.info('=== resources/list HANDLER ===')
            
            const resources = Object.entries(RESOURCES_CACHE).map(([uri, resource]) => ({
                uri,
                name: resource.name,
                description: resource.description,
                mimeType: resource.mimeType
            }))

            const responseBody = {
                jsonrpc: '2.0',
                result: { resources },
                id: requestBody.id,
            }

            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responseBody),
            }
        }

        // Handle resources/read method
        if (requestBody.method === 'resources/read') {
            logger.info('=== resources/read HANDLER ===')
            
            const uri = requestBody.params?.uri
            const resource = RESOURCES_CACHE[uri]

            if (!resource) {
                return {
                    statusCode: 404,
                    headers: buildCommonHeaders(),
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32601,
                            message: `Resource '${uri}' not found`,
                        },
                        id: requestBody.id,
                    }),
                }
            }

            const responseBody = {
                jsonrpc: '2.0',
                result: {
                    contents: [{
                        uri,
                        mimeType: resource.mimeType,
                        text: resource.content
                    }]
                },
                id: requestBody.id,
            }

            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responseBody),
            }
        }

        // Handle prompts/list method
        if (requestBody.method === 'prompts/list') {
            logger.info('=== prompts/list HANDLER ===')
            
            const prompts = Object.entries(PROMPTS_CACHE).map(([name, prompt]) => ({
                name,
                description: prompt.description,
                arguments: prompt.arguments
            }))

            const responseBody = {
                jsonrpc: '2.0',
                result: { prompts },
                id: requestBody.id,
            }

            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responseBody),
            }
        }

        // Handle prompts/get method
        if (requestBody.method === 'prompts/get') {
            logger.info('=== prompts/get HANDLER ===')
            
            const name = requestBody.params?.name
            const promptArgs = requestBody.params?.arguments || {}
            const prompt = PROMPTS_CACHE[name]

            if (!prompt) {
                return {
                    statusCode: 404,
                    headers: buildCommonHeaders(),
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        error: {
                            code: -32601,
                            message: `Prompt '${name}' not found`,
                        },
                        id: requestBody.id,
                    }),
                }
            }

            // Generate prompt content based on arguments
            let promptText = prompt.template
            for (const [key, value] of Object.entries(promptArgs)) {
                promptText = promptText.replace(new RegExp(`{${key}}`, 'g'), value || '')
            }

            const responseBody = {
                jsonrpc: '2.0',
                result: {
                    description: prompt.description,
                    messages: [{
                        role: 'user',
                        content: {
                            type: 'text',
                            text: promptText
                        }
                    }]
                },
                id: requestBody.id,
            }

            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responseBody),
            }
        }

        // Handle any other notification methods that might be sent by clients
        if (requestBody.method && requestBody.method.startsWith('notifications/')) {
            logger.info(`=== ${requestBody.method} HANDLER ===`)
            logger.info(`Processing notification request: ${requestBody.method}`)
            // Notifications typically don't require a response, but some clients expect one
            return {
                statusCode: 200,
                headers: {
                    ...buildCommonHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    result: {},
                    id: requestBody.id,
                }),
            }
        }

        // Method not found
        logger.error(`Unknown method: ${requestBody.method}`)
        return {
            statusCode: 200, // Return 200 to avoid client errors, but with JSON-RPC error
            headers: {
                ...buildCommonHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32601,
                    message: `Method '${requestBody.method}' not found`,
                },
                id: requestBody.id,
            }),
        }

    } catch (error) {
        logger.error('Error in handleMcpRequest:', error)
        return {
            statusCode: 500,
            headers: {
                ...buildCommonHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: `Internal server error: ${error.message}`,
                },
                id: null,
            }),
        }
    }
}

/**
 * Main function for Adobe I/O Runtime
 */
async function main(params) {
    try {
        // Add console.log as backup for debugging
        console.log('=== MCP SERVER MAIN FUNCTION CALLED ===')
        console.log('Method:', params.__ow_method)
        console.log('Action ID:', process.env.__OW_ACTIVATION_ID || 'unknown')
        
        // Initialize logger
        try {
            logger = Core.Logger('mcp-server', { level: params.LOG_LEVEL || 'info' })
            
            if (!logger) {
                console.error('Failed to initialize logger')
                return {
                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Logger initialization failed' })
                }
            }
        } catch (loggerError) {
            console.error('Error creating logger:', loggerError)
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Logger creation error: ${loggerError.message}` })
            }
        }

        logger.info('=== MCP SERVER ACTION STARTED ===')
        logger.info('MCP Server action invoked with method:', params.__ow_method)

        // Handle health check for any path
        if (params.__ow_method === 'get') {
            logger.info('Handling health check request')
            return handleHealthCheck()
        }

        // Handle CORS preflight for any path
        if (params.__ow_method === 'options') {
            logger.info('Handling OPTIONS preflight request')
            return handleOptionsRequest()
        }

        // For POST requests, process MCP JSON-RPC
        if (params.__ow_method === 'post') {
            logger.info('Handling MCP JSON-RPC request')
            const response = await handleMcpRequest(params)
            logger.info('Successfully handled MCP request')
            return response
        }

        // Any other HTTP method is not supported
        logger.info(`Method not allowed: ${params.__ow_method}`)
        return {
            statusCode: 405,
            headers: {
                ...buildCommonHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32601,
                    message: `Method '${params.__ow_method}' not allowed`,
                },
                id: null,
            }),
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
                ...buildCommonHeaders(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: `Unhandled server error: ${error.message}`,
                },
                id: null,
            }),
        }
    }
}

// Export the main function for Adobe I/O Runtime
exports.main = main