import fs from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import express from 'express'
import devalue from '@nuxt/devalue'
import cookieParser from 'cookie-parser'

export async function start(port: number) {
  const template = fs.readFileSync(join(cwd(), 'dist/client/index.html'), 'utf-8')

  const manifest = JSON.parse(
    fs.readFileSync(join(cwd(), 'dist/client/ssr-manifest.json'), 'utf-8'),
  )

  const app = express()
  app.use((await import('compression')).default())
  app.use('/', (await import('serve-static')).default(join(cwd(), 'dist/client'), {
    index: false,
  }))
  app.use(cookieParser())
  app.use('*', async (req, res) => {
    const url = req.originalUrl

    const generateApp = (await import(join(cwd(), 'dist/server/index.js'))).generateApp

    const [appHtml, preloadLinks, state] = await generateApp(url, manifest, req, res)

    let html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, appHtml)

    if (state !== undefined) {
      html = html.replace(`<!--state-->`, `<script>window.__INITIAL_STATE__ = ${devalue(state)}</script>`)
    }

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  })

  app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })
}
