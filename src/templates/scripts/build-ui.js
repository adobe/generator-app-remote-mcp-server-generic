#!/usr/bin/env node
/**
 * Builds every MCP App UI under actions/mcp-server/app-ui/src/<name>/<name>.html, using the
 * shared actions/mcp-server/app-ui/vite.config.mjs (selected per app via the APP env var - see
 * that file). Each app builds flatly into actions/mcp-server/static/<name>.html.
 *
 * CUSTOMIZE: add a new MCP App UI by creating app-ui/src/<name>/<name>.{html,ts,css} - it's
 * picked up automatically, no changes needed here or in vite.config.mjs.
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const appUiSrcDir = path.join(__dirname, '../actions/mcp-server/app-ui/src')
const configPath = path.join(__dirname, '../actions/mcp-server/app-ui/vite.config.mjs')
const viteBin = path.join(__dirname, '../node_modules/.bin/vite')

const appNames = fs.readdirSync(appUiSrcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(appUiSrcDir, name, `${name}.html`)))
    .sort()

if (appNames.length === 0) {
    console.log('No MCP App UIs found under actions/mcp-server/app-ui/src/*/.')
    process.exit(0)
}

for (const name of appNames) {
    console.log(`\n> Building ${name}`)
    execFileSync(viteBin, ['build', '--config', configPath], {
        stdio: 'inherit',
        env: { ...process.env, APP: name }
    })
}
