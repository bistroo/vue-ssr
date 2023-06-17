import fs from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'
import express from 'express'
import devalue from '@nuxt/devalue'
import cookieParser from 'cookie-parser'
import { load } from 'cheerio'
import { type HeadTag } from '@vueuse/head'

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

    const [appHtml, preloadLinks, state, head, teleports, redirect] = await generateApp(url, manifest, req, res)

    if (redirect !== null) {
      res.redirect(redirect)
      return
    }

    const $ = load(template)

    const resolvedTags = await head.resolveTags() as HeadTag[]

    let tags = ['title', 'meta', 'link', 'base', 'style', 'script', 'noscript']

    if ($('title').length === 1) {
      tags = tags.filter(t => t !== 'title')
      const title = resolvedTags.find(t => t.tag === 'title')

      if (title !== undefined) {
        // @ts-ignore
        $('title').text(title.textContent)
      }
    }

    tags.map(tag => {
      resolvedTags.filter(t => t.tag === tag)
        .map(t => {
          let props = ''

          for (const [key, value] of Object.entries(t.props)) {
            props = `${props} ${key}="${value}"`
          }

          if (t.innerHTML !== undefined) {
            $('head').append(`<${tag} ${props}>${t.innerHTML}</${tag}>`)
          } else {
            $('head').append(`<${tag} ${props}>`)
          }
        })
    })

    const bodyAttrs = resolvedTags.find(t => t.tag === 'bodyAttrs')

    if (bodyAttrs !== undefined) {
      for (const [key, value] of Object.entries(bodyAttrs.props)) {
        $('body').attr(key, value)
      }
    }

    const htmlAttrs = resolvedTags.find(t => t.tag === 'htmlAttrs')

    if (htmlAttrs !== undefined) {
      for (const [key, value] of Object.entries(htmlAttrs.props)) {
        $('html').attr(key, value)
      }
    }

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
