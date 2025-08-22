/**
 * Test suite for MCP Server Template
 *
 * This file contains basic tests to verify your MCP server functionality.
 * Add more tests as you customize your server with new tools and features.
 */

const { main } = require('../actions/mcp-server/index.js')

describe('MCP Server Template Tests', () => {
    // Test server health check
    describe('Health Check', () => {
        test('should respond to GET request with health status', async () => {
            const params = {
                __ow_method: 'get',
                __ow_path: '/',
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)
            expect(result.headers['Content-Type']).toBe('application/json')

            const body = JSON.parse(result.body)
            expect(body.status).toBe('healthy')
            expect(body.server).toBe('<%= projectName %>')
            expect(body.version).toBe('1.0.0')
        })
    })

    // Test CORS handling
    describe('CORS Support', () => {
        test('should handle OPTIONS request for CORS preflight', async () => {
            const params = {
                __ow_method: 'options',
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)
            expect(result.headers['Access-Control-Allow-Origin']).toBe('*')
            expect(result.headers['Access-Control-Allow-Methods']).toContain('POST')
        })
    })

    // Test MCP protocol implementation
    describe('MCP Protocol', () => {
        test('should handle initialize request', async () => {
            const initRequest = {
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    clientInfo: {
                        name: 'test-client',
                        version: '1.0.0'
                    }
                }
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(initRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(1)
            expect(body.result.protocolVersion).toBe('2024-11-05')
            expect(body.result.serverInfo.name).toBe('<%= projectName %>')
        })

        test('should handle tools/list request', async () => {
            const toolsListRequest = {
                jsonrpc: '2.0',
                id: 2,
                method: 'tools/list',
                params: {}
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(toolsListRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(2)
            expect(Array.isArray(body.result.tools)).toBe(true)
            expect(body.result.tools.length).toBeGreaterThan(0)

            // Check that echo tool is present
            const echoTool = body.result.tools.find(tool => tool.name === 'echo')
            expect(echoTool).toBeDefined()
            expect(echoTool.description).toContain('echo')
        })

        test('should handle echo tool call', async () => {
            const toolCallRequest = {
                jsonrpc: '2.0',
                id: 3,
                method: 'tools/call',
                params: {
                    name: 'echo',
                    arguments: {
                        message: 'Hello, test!'
                    }
                }
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(toolCallRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(3)
            expect(body.result.content).toBeDefined()
            expect(body.result.content[0].text).toContain('Hello, test!')
        })

        test('should handle calculator tool call', async () => {
            const toolCallRequest = {
                jsonrpc: '2.0',
                id: 4,
                method: 'tools/call',
                params: {
                    name: 'calculator',
                    arguments: {
                        expression: '2 + 3 * 4'
                    }
                }
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(toolCallRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(4)
            expect(body.result.content[0].text).toContain('14')
        })

        test('should include echo, calculator, and weather tools', async () => {
            const toolsListRequest = {
                jsonrpc: '2.0',
                id: 10,
                method: 'tools/list',
                params: {}
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(toolsListRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            const toolNames = body.result.tools.map(tool => tool.name)

            expect(toolNames).toEqual(expect.arrayContaining(['echo', 'calculator', 'weather']))
            expect(toolNames).toHaveLength(3)
            expect(toolNames).not.toContain('example_tool')
            expect(toolNames).not.toContain('file_search')
        })

        test('should handle weather tool call', async () => {
            const toolCallRequest = {
                jsonrpc: '2.0',
                id: 11,
                method: 'tools/call',
                params: {
                    name: 'weather',
                    arguments: {
                        city: 'San Francisco'
                    }
                }
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(toolCallRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(11)
            expect(body.result.content[0].text).toContain('Weather for San Francisco')
            expect(body.result.content[0].text).toContain('Temperature:')
            expect(body.result.content[0].text).toContain('°C')
            expect(body.result.content[0].text).toContain('Humidity:')
            expect(body.result.content[0].text).toContain('Wind:')
            expect(body.result.content[0].text).not.toContain('Forecast')
            expect(body.result.metadata).toBeDefined()
            expect(body.result.metadata.city).toBe('San Francisco')
        })

        test('should handle resources/list request', async () => {
            const resourcesListRequest = {
                jsonrpc: '2.0',
                id: 5,
                method: 'resources/list',
                params: {}
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(resourcesListRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(5)
            expect(Array.isArray(body.result.resources)).toBe(true)
        })

        test('should handle prompts/list request', async () => {
            const promptsListRequest = {
                jsonrpc: '2.0',
                id: 6,
                method: 'prompts/list',
                params: {}
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(promptsListRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(200)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.id).toBe(6)
            expect(Array.isArray(body.result.prompts)).toBe(true)
        })
    })

    // Test error handling
    describe('Error Handling', () => {
        test('should handle invalid JSON-RPC request', async () => {
            const params = {
                __ow_method: 'post',
                __ow_body: 'invalid json',
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            // The server returns 500 for JSON parsing errors, which is correct behavior
            expect(result.statusCode).toBe(500)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.error).toBeDefined()
        })

        test('should handle unknown tool call', async () => {
            const toolCallRequest = {
                jsonrpc: '2.0',
                id: 7,
                method: 'tools/call',
                params: {
                    name: 'nonexistent_tool',
                    arguments: {}
                }
            }

            const params = {
                __ow_method: 'post',
                __ow_body: JSON.stringify(toolCallRequest),
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(404)

            const body = JSON.parse(result.body)
            expect(body.jsonrpc).toBe('2.0')
            expect(body.error.code).toBe(-32601)
        })

        test('should handle unsupported HTTP method', async () => {
            const params = {
                __ow_method: 'put',
                LOG_LEVEL: 'info'
            }

            const result = await main(params)

            expect(result.statusCode).toBe(405)
        })
    })
})

// Additional test helpers and utilities
describe('Custom Tool Tests', () => {
    // Add tests for your custom tools here
    test('should test your custom tool', async () => {
        // Example test for a custom tool
        // Replace with actual tests for your tools

        const toolCallRequest = {
            jsonrpc: '2.0',
            id: 100,
            method: 'tools/call',
            params: {
                name: 'your_custom_tool', // Replace with your tool name
                arguments: {
                    // Add your tool parameters here
                }
            }
        }

        // eslint-disable-next-line no-unused-vars
        const params = {
            __ow_method: 'post',
            __ow_body: JSON.stringify(toolCallRequest),
            LOG_LEVEL: 'info'
        }

        // Uncomment and modify when you add custom tools
        // const result = await main(params)
        // expect(result.statusCode).toBe(200)

        expect(true).toBe(true) // Placeholder assertion
    })
})
