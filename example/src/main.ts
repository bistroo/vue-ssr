import { vueSSR } from 'vite-plugin-vue-ssr'
import { createPinia } from 'pinia'

import App from '@/App.vue'

const Counter = () => import('@/Counter.vue')

const routes = [
  {
    path: '/',
    name: 'counter',
    component: Counter,
  },
]

export default vueSSR(App, { routes }, ({ app, state }) => {
  const pinia = createPinia()
  app.use(pinia)

  console.log(import.meta.env.SSR)

  if (import.meta.env.SSR) {
    state.value = pinia.state.value
  } else {
    pinia.state.value = state.value
  }
})
