/**
 * ESLint Configuration for MCP Server Template
 *
 * This configuration helps maintain code quality and consistency.
 * Customize these rules based on your project preferences.
 */

module.exports = {
    env: {
        browser: false,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'no-unused-vars': ['warn'],
        'no-console': 'off', // Allow console in server code
        'no-eval': 'error', // Prevent eval usage for security
        'prefer-const': 'warn',
        'no-var': 'error',
        eqeqeq: 'error',
        curly: 'error'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'coverage/',
        '*.min.js'
    ]
}
