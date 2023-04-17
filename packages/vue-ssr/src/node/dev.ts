import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { join, dirname, resolve as _resolve } from 'node:path'
import express from 'express'
import vue from '@vitejs/plugin-vue'
import { type UserConfig, mergeConfig } from 'vite'

export async function dev({ port, vite: viteConfig }: { port: number, vite?: UserConfig }) {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const resolve = (p: string) => _resolve(__dirname, p)

  const manifest = {}

  const app = express()

  let vite = await (
    await import('vite')
  ).createServer(mergeConfig({
    base: '/',
    root: cwd(),
    logLevel: 'info',
    plugins: [vue()],
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
      const render = (await vite.ssrLoadModule(resolve('vue/index.js'))).render

      const [appHtml, preloadLinks] = await render(url, manifest, true)

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
