# SSR for Vue 3

Minimalistic wrapper to run SSR Vue 3 apps, based on Vite

## Features
* HMR support
* Vue Router
* State management

## Quick Setup

### Installation

```sh
pnpm install vue-ssr -D
```

Add the following scripts

```json
"scripts": {
  "dev": "vue-ssr",
  "build": "vue-ssr build",
  "start": "vue-ssr start"
},
```

> The `vue-ssr` command creates a dev server with HMR enabled.
To create a production ready build, use `vue-ssr build`. After creating a build, use `vue-ssr start` to serve the build with Express.

### Configuration

Create a vue-ssr.config.js

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

### Usage

```ts
import { vueSSR } from 'vue-ssr'

import App from '@/App.vue'

const Counter = () => import('@/Counter.vue')

const routes = [
  {
    path: '/',
    name: 'counter',
    component: Counter,
  }
]

export default vueSSR(App, { routes })
```

The `main.ts` file should export the imported vueSSR function.

Pinia is supported by using the `app` and `state` property inside the callback.

```typescript
export default vueSSR(App, { routes }, ({ app, state }) => {
  const pinia = createPinia()

  app.use(pinia)

  if (import.meta.env.SSR) {
    state.value = pinia.state.value
  } else {
    pinia.state.value = state.value
  }
})
```

> The state will be persisted on `window.__INITIAL_STATE__` property and serialized using `@nuxt/devalue`

It's possible to make changes to the router, use the `router` property in the callback.

```typescript
export default vueSSR(App, { routes }, ({ app, router }) => {
  router.beforeEach(async (to, from) => {
    if (
      !isAuthenticated &&
      to.name !== 'Login'
    ) {
      return { name: 'Login' }
    }
  })
})
```

## License

MIT
