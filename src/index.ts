import { type Component } from 'vue'
import { type CallbackFn, type VueSsrConfig } from './types'
import { type RouterScrollBehavior, type RouteRecordRaw } from 'vue-router'
import { type Head } from '@unhead/schema'
import { ClientOnly } from './vue/ClientOnly'

export function defineConfig(config: VueSsrConfig) {
  return config
}

export function vueSSR(
  App: Component,
  { routes, head, scrollBehavior }: { routes: RouteRecordRaw[], head?: Head, scrollBehavior?: RouterScrollBehavior },
  cb?: CallbackFn)
{
  return {
    App,
    routes,
    head,
    scrollBehavior,
    cb,
  }
}
export { VueSsrConfig, ClientOnly }
