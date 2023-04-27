import { defineConfig } from 'vue-ssr'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  devPort: 1234,
  startPort: 1234,
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
