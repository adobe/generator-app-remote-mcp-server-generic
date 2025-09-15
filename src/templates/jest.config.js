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
 * Jest Configuration for MCP Server Template
 *
 * This configuration sets up Jest for testing your MCP server.
 * Customize these settings based on your testing needs.
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Test file patterns
    testMatch: [
        '**/test/**/*.test.js',
        '**/test/**/*.spec.js'
    ],

    // Coverage collection
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],

    // Coverage patterns
    collectCoverageFrom: [
        'actions/**/*.js',
        '!actions/**/dist/**',
        '!actions/**/node_modules/**'
    ],

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],

    // Module paths
    moduleDirectories: ['node_modules', '<rootDir>'],

    // Timeout for tests (in milliseconds)
    testTimeout: 30000,

    // Verbose output
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Error handling
    errorOnDeprecated: true,

    // Transform files
    transform: {
        '^.+\\.js$': 'babel-jest'
    }
}
