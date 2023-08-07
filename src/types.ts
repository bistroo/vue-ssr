import { UserConfig } from 'vite'
import { type App } from 'vue'
import { type Router } from 'vue-router'
import { Request, Response } from 'express'

export type VueSsrConfig = {
  ssr?: boolean
  vite?: UserConfig
  port?: number
  hostname?: string
}

export type State = { value?: any }

export type CallbackFn = (params: {
  app: App
  router: Router
  state: State
  request?: Request
  response?: Response
}) => void
