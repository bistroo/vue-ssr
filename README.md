# SSR for Vue 3

> Minimalistic wrapper to run SSR Vue 3 apps, based on Vite

## Quick Setup

1. Add the following dependency to your project

```sh
pnpm install vue-ssr -D
```

2. Replace the Vite commands

```diff
  "scripts": {
-    "dev": "vite",
+    "dev": "vue-ssr",
-    "build": "vite build"
+    "build": "vue-ssr build",
-    "preview": "vite preview"
+    "start": "vue-ssr start"
  },
```

The `vue-ssr` command creates a dev server with HMR enabled.
To create a production ready build, use `vue-ssr build`. After creating a build, use `vue-ssr start` to serve the build with Express.

3. Create a vue-ssr.config.js

```js
import { defineConfig } from 'vue-ssr'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  devPort: 5173,
  startPort: 6173,
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
```

> Use the `vite` property with caution.

## License

MIT
