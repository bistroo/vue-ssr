import { type Component } from 'vue'
import { type CallbackFn, type VueSsrConfig } from './types'
import { type RouteRecordRaw } from 'vue-router'
import { type Head } from '@unhead/schema'
import { ClientOnly } from './vue/ClientOnly'

export function defineConfig(config: VueSsrConfig) {
  return config
}

export function vueSSR(
  App: Component,
  { routes, head }: { routes: RouteRecordRaw[], head?: Head },
  cb?: CallbackFn)
{
  return {
    App,
    routes,
    head,
    cb,
  }
}
export { VueSsrConfig, ClientOnly }
