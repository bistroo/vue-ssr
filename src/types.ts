import { UserConfig } from 'vite'
import { type App } from 'vue'
import { type Router } from 'vue-router'

export type VueSsrConfig = {
  vite?: UserConfig
  devPort?: number
  startPort?: number
}

export type State = { value?: any }

export type CallbackFn = (params: {
  app: App
  router: Router
  state: State
}) => void
