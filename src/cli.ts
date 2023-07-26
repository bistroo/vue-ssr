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

const { host, port } = args

if (command === 'build') {
  await build(config?.vite)
} else if (command === 'start') {
  await start(port ?? config?.port ?? 5173, host ?? config?.hostname ?? 'localhost')
} else {
  await dev({ port: port ?? config?.port ?? 5173, hostname: host ?? config?.hostname ?? 'localhost', viteConfig: config?.vite })
}
