import mri from 'mri'
import { loadConfig } from 'c12'
import { argv } from 'node:process'
import { VueSsrConfig } from './types'
import { dev } from './node/dev'
import { build } from './node/build'
import { start } from './node/start'

const args = mri(argv.slice(2));
const command = args._[0];

const { host, port, config: c, ssr } = args

const { config } = await loadConfig<VueSsrConfig>({ configFile: c ?? 'vue-ssr.config.ts' })

if (command === 'build') {
  await build(config?.vite, ssr !== undefined ? /^true$/i.test(ssr) : config?.ssr ?? true)
} else if (command === 'start') {
  await start(
    port ?? config?.port ?? 5173,
    host ?? config?.hostname ?? 'localhost'
  )
} else {
  await dev({
    port: port ?? config?.port ?? 5173,
    hostname: host ?? config?.hostname ?? 'localhost',
    viteConfig: config?.vite,
  })
}
