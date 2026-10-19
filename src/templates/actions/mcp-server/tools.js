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

const fs = require('fs/promises')
const path = require('path')
const { z } = require('zod')

// Adobe I/O Runtime only deploys the bundled index.js - no sibling static/ files - so the
// weather-app UI must ride inside the bundle as a required JS string (see scripts/embed-ui.js,
// run via `npm run embed:ui` as part of `npm run build`). Falls back to reading actions/mcp-server/static/
// on disk for local dev when the embed step hasn't been run yet.
let embeddedUi = null
try {
    embeddedUi = require('./embedded-ui.js')
} catch {
    // Local dev without embed step - falls back to reading actions/mcp-server/static/
}

async function loadUiHtml (filePath, embeddedKey) {
    const embedded = embeddedUi?.[embeddedKey]
    if (typeof embedded === 'string' && embedded.length > 0) {
        return embedded
    }
    return fs.readFile(filePath, 'utf-8')
}

// UI resource for the weather tool - links the tool result to its rendered card (see registerResources)
const WEATHER_RESOURCE_URI = 'ui://weather/mcp-app.html'
const WEATHER_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app'

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

    // Example weather API tool - demonstrates external API calls and an MCP App UI
    // (weather-app/) that renders the result as a themed, animated card.
    server.registerTool(
        'weather',
        {
            title: 'Weather',
            description: 'Get current weather information for any city. This tool demonstrates how to integrate with external APIs, handle real-time data, and render a themed MCP App UI.',
            inputSchema: {
                city: z.string().describe('Name of the city to get weather for (e.g., "San Francisco", "New York", "London")')
            },
            // Note: no outputSchema here. The MCP SDK's zod-to-json-schema conversion stamps a
            // draft-07 $schema onto declared outputSchemas, which strict 2020-12-only clients
            // reject client-side before the tool call ever reaches this server (see
            // https://github.com/modelcontextprotocol/typescript-sdk/issues/2532). structuredContent
            // below still drives the weather-app UI without needing a declared outputSchema.
            // Links this tool's result to the weather-app UI resource registered below
            _meta: {
                ui: { resourceUri: WEATHER_RESOURCE_URI },
                'ui/resourceUri': WEATHER_RESOURCE_URI
            }
        },
        async ({ city = 'Unknown City' }) => {
            try {
                // CUSTOMIZE: Replace this section with actual API calls
                // Example API integrations:
                // - OpenWeatherMap API
                // - WeatherAPI.com
                // - AccuWeather API
                //
                // For now, we'll return realistic mock data with random variations.
                // Conditions are grouped by category so the UI can theme itself
                // (sun / clouds / rain / snow) and temperature ranges stay coherent
                // with the picked category.
                const conditionsByCategory = {
                    sunny: { conditions: ['Sunny', 'Clear'], tempRange: [18, 32] },
                    cloudy: { conditions: ['Partly Cloudy', 'Cloudy', 'Overcast'], tempRange: [10, 22] },
                    rain: { conditions: ['Light Rain', 'Scattered Showers', 'Drizzle', 'Heavy Rain', 'Thunderstorm'], tempRange: [4, 16] },
                    snow: { conditions: ['Snow', 'Light Snow', 'Flurries', 'Heavy Snow'], tempRange: [-8, 3] }
                }

                // Weighted so sun/clouds are most common, snow is rarest
                const categoryRoll = Math.random()
                const category = categoryRoll < 0.35 ? 'sunny'
                    : categoryRoll < 0.65 ? 'cloudy'
                        : categoryRoll < 0.90 ? 'rain'
                            : 'snow'

                const { conditions, tempRange } = conditionsByCategory[category]
                const currentCondition = conditions[Math.floor(Math.random() * conditions.length)]
                const temperature = Math.round((tempRange[0] + Math.random() * (tempRange[1] - tempRange[0])) * 10) / 10

                const humidity = Math.floor(Math.random() * 40) + 40 // 40-80%
                const windSpeed = Math.floor(Math.random() * 15) + 5 // 5-20 km/h
                const pressure = Math.floor(Math.random() * 30) + 1000 // 1000-1030 hPa
                const visibility = Math.floor(Math.random() * 5) + 10 // 10-14 km
                const uvIndex = Math.floor(Math.random() * 8) + 1 // 1-8
                const lastUpdated = new Date().toISOString()

                const structuredContent = {
                    city,
                    country: 'Sample Country', // In real API, this would come from the response
                    category,
                    condition: currentCondition,
                    temperature,
                    humidity,
                    windSpeed,
                    pressure,
                    visibility,
                    uvIndex,
                    lastUpdated
                }

                const categoryEmoji = { sunny: '☀️', cloudy: '☁️', rain: '🌧️', snow: '❄️' }[category]

                // Format response for display (fallback for hosts without MCP App UI support)
                let responseText = `${categoryEmoji} Weather for ${city}\n`
                responseText += '⚠️ **EXAMPLE DATA - NOT REAL WEATHER** ⚠️\n\n'
                responseText += `🌡️ Temperature: ${temperature}°C\n`
                responseText += `☁️ Conditions: ${currentCondition}\n`
                responseText += `💧 Humidity: ${humidity}%\n`
                responseText += `💨 Wind: ${windSpeed} km/h\n`
                responseText += `📊 Pressure: ${pressure} hPa\n`
                responseText += `👁️ Visibility: ${visibility} km\n`
                responseText += `☀️ UV Index: ${uvIndex}\n`
                responseText += `\n⏰ Last Updated: ${new Date(lastUpdated).toLocaleString()}`
                responseText += '\n\n💡 Note: This is mock/example data for demonstration purposes only. Replace with real weather API calls in production.'

                return {
                    content: [
                        {
                            type: 'text',
                            text: responseText
                        }
                    ],
                    structuredContent
                }
            } catch (error) {
                return {
                    isError: true,
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

    // Weather MCP App UI - serves the bundled HTML/CSS/JS card that the
    // `weather` tool links to via `_meta.ui.resourceUri` (see registerTools above).
    server.registerResource(
        WEATHER_RESOURCE_URI,
        WEATHER_RESOURCE_URI,
        { mimeType: WEATHER_RESOURCE_MIME_TYPE },
        async () => {
            const html = await loadUiHtml(path.join(__dirname, 'static', 'weather.html'), 'weatherHtml')
            return {
                contents: [
                    {
                        uri: WEATHER_RESOURCE_URI,
                        mimeType: WEATHER_RESOURCE_MIME_TYPE,
                        text: html
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
