# vite-plugin-vue-ssr

Vite plugin to develop Vue 3 SSR apps

## Features
* HMR support
* Vue Router
* State management
* Teleports
* Document head management (powered by [@vueuse/head](https://github.com/vueuse/head))

## Quick Setup

### Installation

```sh
pnpm install vite-plugin-vue-ssr -D
```

vite.config.ts
```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueSsr from 'vite-plugin-vue-ssr/plugin'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vueSsr(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

```

### Usage

Add the build commands to your `package.json` file.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "pnpm run build:client && pnpm run build:server",
    "build:client": "vite build --ssrManifest --outDir dist/client",
    "build:server": "vite build --ssr src/main.ts --outDir dist/server"
  }
}
```

This will build a client and server bundle.

Use the `vite` command to start a SSR enabled dev server.

> Disabling SSR in vite will enable to build a SPA version.

The `main.ts` file should export the imported vueSSR function.

```ts
import { vueSSR } from 'vite-plugin-vue-ssr'

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

Pinia/Vuex is supported by using the `app` and `state` property inside the callback.

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
export default vueSSR(App, { routes }, ({ router }) => {
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

The Express request and response objects are accessible from the callback. Make sure to wrap them in `import.meta.env.SSR`.

```typescript
export default vueSSR(App, { routes }, ({ request, response }) => {
  if (import.meta.env.SSR) {
    console.log(request?.originalUrl)
  }
})
```

Or use `useSSRContext`.

```typescript
const { request, response } = useSSRContext()

if (import.meta.env.SSR) {
  console.log(request?.originalUrl)
}
```

Using Teleport is supported, but requires a little bit of setup. Targeting `body` is not supported, use `#teleports` instead.


```html
<template>
  <Teleport to="#teleports">
    <button @click="store.increment">Increment</button>
  </Teleport>
</template>
```

During SSR, the Teleport component will be rendered as a `div` with the `id` set to the `to` property.

## License

MIT
