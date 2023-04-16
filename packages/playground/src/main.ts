import { vueSSR } from 'vue-ssr'

import App from '@/App.vue'

const Root = () => import('@/Root.vue')

const routes = [
  {
    path: '/',
    name: 'root',
    component: Root,
  }
]

export default vueSSR(App, { routes })
