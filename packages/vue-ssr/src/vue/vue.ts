import { type Component, createSSRApp, type App } from 'vue'
import {
  type RouteRecordRaw,
  createMemoryHistory,
  createRouter,
  createWebHistory
} from 'vue-router'
import { type State, type CallbackFn } from '../types'

export function vueSSR(
  App: Component,
  { routes }: { routes: RouteRecordRaw[] },
  cb?: CallbackFn) {
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory('/')
      : createWebHistory('/'),
    routes,
  })

  const state: State = {
    value: undefined,
  }

  if (!import.meta.env.SSR) {
    state.value = window.__INITIAL_STATE__ as object
  }

  const app = createSSRApp(App)
  app.use(router)

  if (cb !== undefined) {
    cb({ app, router, state })
  }

  return {
    app,
    router,
    state: state.value,
  }
}
