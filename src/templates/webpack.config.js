const path = require('path')

module.exports = {
    entry: './actions/mcp-server/index.js',
    mode: 'production',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    }
}
