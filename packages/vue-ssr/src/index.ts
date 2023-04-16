import { type Component, createSSRApp } from 'vue'
import { type VueSsrConfig } from './types'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'

export function defineConfig(config: VueSsrConfig) {
  return config
}

export function vueSSR(
  App: Component,
  { routes }: { routes: RouteRecordRaw[] },
  cb?: ({ app, router }: { app: any, router: Router }) => void)
{
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory('/test/')
      : createWebHistory('/test/'),
    routes,
  })

  if (!import.meta.env.SSR) {
    const app = createSSRApp(App)
    app.use(router)

    if (cb !== undefined) {
      cb({ app, router })
    }

    router.isReady().then(() => {
      app.mount('#app')

      console.log('hydrated')
    })
  }

  return () => {
    const app = createSSRApp(App)
    app.use(router)

    if (cb !== undefined) {
      cb({ app, router })
    }

    return { app, router }
  }
}
export { VueSsrConfig }
