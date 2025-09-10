/**
 * MCP Server Tools - Organized in separate module
 *
 * This file contains all the tools available in the MCP server, organized using
 * the official MCP TypeScript SDK. Each tool is registered using the server.tool()
 * method and follows the MCP specification for tool definitions.
 *
 * Tools included:
 * - echo: Simple echo tool for testing connectivity
 * - calculator: Basic mathematical calculations
 * - MyWeather: Mock weather API tool (demonstrates external API patterns)
 */

const { z } = require('zod')

/**
 * Register all tools with the MCP server
 * @param {McpServer} server - The MCP server instance
 */
function registerTools (server) {
    // Basic echo tool for testing connectivity
    server.tool(
        'echo',
        'A simple utility tool that echoes back the input message. Useful for testing connectivity, debugging, or confirming that the MCP server is responding correctly to requests.',
        {
            message: z.string().describe('The message you want to echo back - useful for testing and debugging')
        },
        async ({ message = 'No message provided' }) => {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Echo: ${message}`
                    }
                ]
            }
        }
    )

    // Example calculation tool
    server.tool(
        'calculator',
        'Perform basic mathematical calculations. Supports arithmetic operations and common mathematical functions.',
        {
            expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 3 * 4", "sqrt(16)", "sin(30)")'),
            format: z.enum(['decimal', 'scientific', 'fraction']).optional().describe('Number format for the result (default: decimal)')
        },
        async ({ expression = '', format = 'decimal' }) => {
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
                            text: `🧮 Calculation Result:\n\nExpression: ${expression}\nResult: ${formattedResult}`
                        }
                    ]
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Calculation Error:\n\nExpression: ${expression}\nError: ${error.message}\n\nPlease check your expression and try again.`
                        }
                    ]
                }
            }
        }
    )

    // Example weather API tool - demonstrates external API calls
    server.tool(
        'weather',
        'Get current weather information for any city. This tool demonstrates how to integrate with external APIs and handle real-time data.',
        {
            city: z.string().describe('Name of the city to get weather for (e.g., "San Francisco", "New York", "London")')
        },
        async ({ city = 'Unknown City' }) => {
            try {
                // CUSTOMIZE: Replace this section with actual API calls
                // Example API integrations:
                // - OpenWeatherMap API
                // - WeatherAPI.com
                // - AccuWeather API
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
                    city,
                    country: 'Sample Country', // In real API, this would come from the response
                    current: {
                        temperature,
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
                            text: responseText
                        }
                    ],
                    // Optional: Include structured data
                    metadata: {
                        source: 'mock-weather-service',
                        city,
                        timestamp: new Date().toISOString(),
                        raw_data: weatherData
                    }
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Weather Error: Unable to fetch weather data for ${city}.\n\nError: ${error.message}\n\nThis could happen due to:\n- Invalid city name\n- API service unavailable\n- Network connectivity issues\n- API rate limiting\n\nPlease try again with a valid city name.`
                        }
                    ]
                }
            }
        }
    )


}

/**
 * Register resources with the MCP server
 * Resources provide static content that AI assistants can access
 * @param {McpServer} server - The MCP server instance
 */
function registerResources (server) {
    // Example static resource
    server.resource(
        'example-resource-1',
        'example://resource1',
        {
            name: 'Example Resource 1',
            description: 'A sample text resource for demonstration purposes',
            mimeType: 'text/plain'
        },
        async () => {
            return {
                contents: [
                    {
                        uri: 'example://resource1',
                        text: 'This is the content of example resource 1. It demonstrates how resources work in the MCP protocol. Resources can contain documentation, reference data, configuration files, or any static content your AI assistant might need.',
                        mimeType: 'text/plain'
                    }
                ]
            }
        }
    )

    // API Documentation resource
    server.resource(
        'api-docs',
        'docs://api',
        {
            name: 'API Documentation',
            description: 'Example API documentation resource',
            mimeType: 'text/markdown'
        },
        async () => {
            const content = `# API Documentation

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

            return {
                contents: [
                    {
                        uri: 'docs://api',
                        text: content,
                        mimeType: 'text/markdown'
                    }
                ]
            }
        }
    )

    // Configuration resource
    server.resource(
        'config-settings',
        'config://settings',
        {
            name: 'Configuration Settings',
            description: 'Example configuration and settings reference',
            mimeType: 'application/json'
        },
        async () => {
            const config = {
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
            }

            return {
                contents: [
                    {
                        uri: 'config://settings',
                        text: JSON.stringify(config, null, 2),
                        mimeType: 'application/json'
                    }
                ]
            }
        }
    )


}

/**
 * Register prompts with the MCP server
 * Prompts are reusable templates that AI assistants can use
 * @param {McpServer} server - The MCP server instance
 */
function registerPrompts (server) {
    // Weather information prompt
    server.prompt(
        'weather-info',
        'Simple prompt to explain the weather tool functionality',
        {
            city: z.string().optional().describe('City name to use in the example')
        },
        async ({ city = 'San Francisco' }) => {
            const template = `Explain how the weather tool works in this MCP server.

Example city: ${city}

The weather tool:
- Takes a city name as input
- Returns current weather information
- Shows temperature, conditions, humidity, wind, and other details
- Currently uses mock/example data for demonstration
- Can be replaced with real weather API calls for production use

Note: This is a demonstration tool that shows how to build weather functionality in an MCP server.`

            return {
                messages: [
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: template
                        }
                    }
                ]
            }
        }
    )


}

// Export all functions for CommonJS
module.exports = {
    registerTools,
    registerResources,
    registerPrompts
}
