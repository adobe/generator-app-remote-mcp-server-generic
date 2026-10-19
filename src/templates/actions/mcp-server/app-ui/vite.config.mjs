import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// APP selects which UI to build. Each MCP App UI lives under src/<app-name>/<app-name>.html
// (see scripts/build-ui.js, which builds every one of them by setting this env var in turn).
const APP = process.env.APP || 'weather'
const appRoot = path.join(__dirname, 'src', APP)

export default defineConfig({
  root: appRoot,
  plugins: [viteSingleFile()],
  build: {
    outDir: path.join(__dirname, '../static'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.join(appRoot, `${APP}.html`)
    }
  }
})
