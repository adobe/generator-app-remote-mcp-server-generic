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

const js = require('@eslint/js')
const globals = require('globals')
const jest = require('eslint-plugin-jest')

module.exports = [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/static/**', 'coverage/**', 'actions/mcp-server/embedded-ui.js']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
      'no-eval': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error'
    }
  },
  {
    ...jest.configs['flat/recommended'],
    files: ['test/**/*.js', '**/*.test.js'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/expect-expect': 'warn'
    }
  }
]
