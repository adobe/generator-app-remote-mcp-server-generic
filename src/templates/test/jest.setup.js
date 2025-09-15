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
 * Jest Test Setup
 *
 * This file runs before each test and sets up the testing environment.
 * Add any global test configuration, mocks, or utilities here.
 */

// Increase timeout for I/O Runtime tests
jest.setTimeout(30000)

// Mock console to reduce noise during testing (optional)
// Uncomment the lines below if you want to suppress console output during tests
/*
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
*/

// Global test utilities
global.createMockMcpRequest = (method, params = {}, id = 1) => ({
    jsonrpc: '2.0',
    id,
    method,
    params
})

global.createMockI18nParams = (body, method = 'post') => ({
    __ow_method: method,
    __ow_body: typeof body === 'string' ? body : JSON.stringify(body),
    LOG_LEVEL: 'info'
})

// Mock Adobe I/O SDK Core Logger if needed
jest.mock('@adobe/aio-sdk', () => ({
    Core: {
        Logger: jest.fn().mockReturnValue({
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        })
    }
}))

// Add any additional global setup here
beforeAll(() => {
    // Global setup before all tests
})

afterAll(() => {
    // Global cleanup after all tests
})

beforeEach(() => {
    // Setup before each test
})

afterEach(() => {
    // Cleanup after each test
})
