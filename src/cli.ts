import mri from 'mri'
import { loadConfig } from 'c12'
import { argv } from 'node:process'
import { VueSsrConfig } from './types'
import { dev } from './node/dev'
import { build } from './node/build'
import { start } from './node/start'

const { config } = await loadConfig<VueSsrConfig>({ name: 'vue-ssr' })

const args = mri(argv.slice(2));
const command = args._[0];

if (command === 'build') {
  await build(config?.vite)
} else if (command === 'start') {
  await start(config?.startPort ?? 5173)
} else {
  await dev({ port: config?.devPort ?? 6173, viteConfig: config?.vite })
}
