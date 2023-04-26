import { type Component, createSSRApp, type App } from 'vue'
import {
  type RouteRecordRaw,
  type Router,
  createMemoryHistory,
  createRouter,
  createWebHistory
} from 'vue-router'

export function vueSSR(App: Component,
  { routes }: { routes: RouteRecordRaw[] },
  cb?: ({ app, router }: { app: App, router: Router }) => void) {
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory('/')
      : createWebHistory('/'),
    routes,
  })

  const app = createSSRApp(App)
  app.use(router)

  if (cb !== undefined) {
    cb({ app, router })
  }

  return {
    app,
    router,
  }
}
