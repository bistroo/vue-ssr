import { type UserConfig, build as _build, mergeConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cwd } from 'node:process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { vueSsrPlugin } from '../vue/plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function build(viteConfig?: UserConfig) {
  const base = '/'

  const plugins = [vue()]

  await _build(mergeConfig({
    base,
    build: {
      ssr: true,
      outDir: 'dist/server',
      rollupOptions: {
        input: [
          join(__dirname, 'vue/index.js'),
          join(cwd(), 'src/main.ts'),
        ],
        output: {
          dir: 'dist/server',
        },
      },
    },
    plugins,
  }, viteConfig ?? {}))

  await _build(mergeConfig({
    base,
    build: {
      ssrManifest: true,
      outDir: 'dist/client',
    },
    plugins: [...plugins, vueSsrPlugin()],
  }, viteConfig ?? {}))
}
