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
