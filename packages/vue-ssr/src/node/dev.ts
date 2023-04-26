import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { join, dirname, resolve } from 'node:path'
import express from 'express'
import vue from '@vitejs/plugin-vue'
import { type UserConfig, mergeConfig } from 'vite'
import { vueSsrPlugin } from '../vue/plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function dev({ port, vite: viteConfig }: { port: number, vite?: UserConfig }) {
  const manifest = {}

  const app = express()

  let vite = await (
    await import('vite')
  ).createServer(mergeConfig({
    base: '/',
    root: cwd(),
    logLevel: 'info',
    plugins: [vue(), vueSsrPlugin()],
    server: {
      middlewareMode: true,
    },
    appType: 'custom',
  }, viteConfig ?? {}))

  app.use(vite.middlewares)
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template = fs.readFileSync(join(cwd(), 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      const generateApp = (await vite.ssrLoadModule(resolve(__dirname, 'vue/index.js'))).generateApp

      const [appHtml, preloadLinks] = await generateApp(url, manifest, true)

      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)

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
