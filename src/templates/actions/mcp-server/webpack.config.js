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

const path = require('path')

// With SDK 1.24+, bundle the Web Standard transport so it works at runtime (serverless often deploys bundle only).
// With SDK 1.17.4, the module does not exist so mark external so build does not fail.
const webStandardModule = '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
let externals = []
try {
  require.resolve(webStandardModule)
} catch (_) {
  externals = [webStandardModule]
}

module.exports = {
    entry: './index.js',
    mode: 'production',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    externals,
    ignoreWarnings: [
        { module: /\/node_modules\/express\/lib\/view\.js$/, message: /Critical dependency: the request of a dependency is an expression/ }
    ]
}
