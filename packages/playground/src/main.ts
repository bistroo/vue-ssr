import { vueSSR } from 'vue-ssr'

import App from '@/App.vue'

const Counter = () => import('@/Counter.vue')

const routes = [
  {
    path: '/',
    name: 'counter',
    component: Counter,
  }
]

export default vueSSR(App, { routes })
