import { defineConfig } from '@bistroo/vue-ssr'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
