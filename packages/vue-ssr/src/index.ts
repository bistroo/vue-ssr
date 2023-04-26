import { type App, type Component } from 'vue'
import { type VueSsrConfig } from './types'
import {
  type RouteRecordRaw,
  type Router,
} from 'vue-router'

export function defineConfig(config: VueSsrConfig) {
  return config
}

export function vueSSR(
  App: Component,
  { routes }: { routes: RouteRecordRaw[] },
  cb?: ({ app, router }: { app: App, router: Router }) => void)
{
  return {
    App,
    routes,
    cb,
  }
}
export { VueSsrConfig }
