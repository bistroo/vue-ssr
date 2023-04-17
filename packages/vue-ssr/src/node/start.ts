import fs from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import express from 'express'

export async function start(port: number) {
  const indexProd = fs.readFileSync(join(cwd(), 'dist/client/index.html'), 'utf-8')

  const manifest = JSON.parse(
    fs.readFileSync(join(cwd(), 'dist/client/ssr-manifest.json'), 'utf-8'),
  )

  const app = express()
  app.use((await import('compression')).default())
  app.use('/', (await import('serve-static')).default(join(cwd(), 'dist/client'), {
    index: false,
  }),)
  app.use('*', async (req, res) => {
    const url = req.originalUrl

    const template = indexProd
    const render = (await import(join(cwd(), 'dist/server/index.js'))).render

    const [appHtml, preloadLinks] = await render(url, manifest, false)

    const html = template
      .replace(`<!--preload-links-->`, preloadLinks)
      .replace(`<!--app-html-->`, appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  })

  app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })
}
