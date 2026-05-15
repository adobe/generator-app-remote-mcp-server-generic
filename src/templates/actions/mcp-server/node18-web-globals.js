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

'use strict'

const { Blob } = require('node:buffer')

// MCP SDK 1.24+ references global File at module load time. OpenWhisk nodejs:18 lacks it (nodejs:20 defines File).
if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File extends Blob {
    constructor (fileBits, fileName, options = {}) {
      super(fileBits, options)
      this.name = String(fileName)
      this.lastModified = options.lastModified ?? Date.now()
    }

    get [Symbol.toStringTag] () {
      return 'File'
    }
  }
}
