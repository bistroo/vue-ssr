import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { join, dirname, resolve } from 'node:path'
import express from 'express'
import vue from '@vitejs/plugin-vue'
import { type UserConfig, mergeConfig, createServer } from 'vite'
import devalue from '@nuxt/devalue'
import { vueSsrPlugin } from '../vue/plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function dev({ port, viteConfig: viteConfig }: { port: number, viteConfig?: UserConfig }) {
  const manifest = {}

  const vite = await createServer(mergeConfig({
    base: '/',
    root: cwd(),
    logLevel: 'info',
    plugins: [vue(), vueSsrPlugin()],
    server: {
      middlewareMode: true,
    },
    appType: 'custom',
  }, viteConfig ?? {}))

  const app = express()

  app.use(vite.middlewares)
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template = fs.readFileSync(join(cwd(), 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      
      const generateApp = (await vite.ssrLoadModule(resolve(__dirname, 'vue/index.js'))).generateApp

      const [appHtml, preloadLinks, state] = await generateApp(url, manifest, true)

      let html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)

      if (state !== undefined) {
        html = html.replace(`<!--state-->`, `<script>window.__INITIAL_STATE__ = ${devalue(state)}</script>`)
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })
}