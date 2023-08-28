import { type Component, createSSRApp, createApp } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  createWebHistory
} from 'vue-router'
import { createHead } from '@vueuse/head'
import type { State, CallbackFn, Params } from './types'

export function vueSSR(App: Component, params: Params, cb?: CallbackFn, ssr = false) {
  const { routes, head: headDefaults, scrollBehavior } = params

  const router = createRouter({
    history: ssr ? createMemoryHistory('/') : createWebHistory('/'),
    routes,
    scrollBehavior,
  })

  const state: State = {
    value: undefined,
  }

  if (!ssr) {
    state.value = window.__INITIAL_STATE__ as object
  }

  const head = createHead(headDefaults)

  const app = ssr ? createSSRApp(App) : createApp(App)
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
