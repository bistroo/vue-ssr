import fs from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import express from 'express'
import devalue from '@nuxt/devalue'
import cookieParser from 'cookie-parser'
import { load } from 'cheerio'

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

    const [appHtml, preloadLinks, state, teleports] = await generateApp(url, manifest, req, res)

    const $ = load(template)

    $('head').append(preloadLinks)
    $('#app').html(appHtml)

    if (state !== undefined) {
      $('body').append(`<script>window.__INITIAL_STATE__ = ${devalue(state)}</script>`)
    }

    if (teleports['#teleports'] !== undefined) {
      $('body').append(`<div id="teleports">${teleports['#teleports']}</div>`)
    }

    res.status(200).set({ 'Content-Type': 'text/html' }).end($.html())
  })

  app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })
}
