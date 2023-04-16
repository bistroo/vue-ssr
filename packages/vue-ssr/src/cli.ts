import mri from 'mri'
import { argv, cwd } from 'node:process'
import { join } from 'node:path'
import { VueSsrConfig } from './types'
import { dev } from './node/dev'
import { build } from './node/build'
import { server } from './node/server'

// TODO: enable ts
const config: VueSsrConfig = (await import(join(cwd(), 'vue-ssr.config.js'))).default

const args = mri(argv.slice(2));
const command = args._[0];

if (command === 'build') {
  await build(config.vite)
} else if (command === 'server1') {
  await server(config.runPort ?? 5173)
} else {
  await dev({ port: config.runPort ?? 6173, vite: config.vite })
}
