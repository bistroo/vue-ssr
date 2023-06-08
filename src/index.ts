import { type Component } from 'vue'
import { type CallbackFn, type VueSsrConfig } from './types'
import { type RouteRecordRaw } from 'vue-router'
import { ClientOnly } from './vue/ClientOnly'

export function defineConfig(config: VueSsrConfig) {
  return config
}

export function vueSSR(
  App: Component,
  { routes }: { routes: RouteRecordRaw[] },
  cb?: CallbackFn)
{
  return {
    App,
    routes,
    cb,
  }
}
export { VueSsrConfig, ClientOnly }
