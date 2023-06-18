import { type Component, createSSRApp } from 'vue'
import {
  type RouteRecordRaw,
  createMemoryHistory,
  createRouter,
  createWebHistory,
RouterScrollBehavior
} from 'vue-router'
import { createHead } from '@vueuse/head'
import { type Head } from '@unhead/schema'
import { type State, type CallbackFn } from '../types'

export function vueSSR(
  App: Component,
  { routes, head: headDefaults, scrollBehavior }: { routes: RouteRecordRaw[], head?: Head, scrollBehavior?: RouterScrollBehavior },
  cb?: CallbackFn) {
  const router = createRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory('/')
      : createWebHistory('/'),
    routes,
    scrollBehavior,
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
