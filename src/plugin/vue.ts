import { type Component, createSSRApp, createApp } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  createWebHistory
} from 'vue-router'
import { createHead } from '@vueuse/head'
import type { State, CallbackFn, Params } from '../types'

export function vueSSR(App: Component, params: Params, cb?: CallbackFn, ssrBuild = false, ssr = false) {
  const { routes, head: headDefaults, scrollBehavior } = params

  const state: State = {
    value: undefined,
  }

  if (!ssr) {
    // @ts-ignore
    state.value = window.__INITIAL_STATE__ as object
  }

  const app = ssrBuild ? createSSRApp(App) : createApp(App)

  const router = createRouter({
    history: ssr ? createMemoryHistory('/') : createWebHistory('/'),
    routes,
    scrollBehavior,
  })
  app.use(router)

  const head = createHead(headDefaults)
  app.use(head)

  if (cb !== undefined) {
    cb({ app, router, state })
  }

  return {
    app,
    router,
    state,
    head,
    scrollBehavior,
    cb,
  }
}
