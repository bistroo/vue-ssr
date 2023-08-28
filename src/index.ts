import type { Component } from 'vue'
import type { Params, CallbackFn } from './types'
import { ClientOnly } from './ClientOnly'

export function vueSSR(App: Component, { routes, head, scrollBehavior }: Params, cb?: CallbackFn) {
  return {
    App,
    routes,
    head,
    scrollBehavior,
    cb,
  }
}
export { ClientOnly }
