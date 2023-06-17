import { type Component, createSSRApp } from 'vue'
import {
  type RouteRecordRaw,
  createMemoryHistory,
  createRouter,
  createWebHistory
} from 'vue-router'
import { createHead } from '@vueuse/head'
import { type Head } from '@unhead/schema'
import { type State, type CallbackFn } from '../types'

export function vueSSR(
  App: Component,
  { routes, head: headDefaults }: { routes: RouteRecordRaw[], head?: Head },
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

  const head = createHead(headDefaults)

  const app = createSSRApp(App)
  app.use(router)
  app.use(head)

  if (cb !== undefined) {
    cb({ app, router, state })
  }

  return {
    app,
    router,
    state: state.value,
    head,
  }
}
