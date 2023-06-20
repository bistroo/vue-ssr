import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { join, dirname, resolve } from 'node:path'
import express from 'express'
import vue from '@vitejs/plugin-vue'
import { type UserConfig, mergeConfig, createServer } from 'vite'
import devalue from '@nuxt/devalue'
import { type HeadTag } from '@vueuse/head'
import cookieParser from 'cookie-parser'
import { load } from 'cheerio'
import { vueSsrPlugin } from '../vue/plugin'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function dev({ port, hostname, viteConfig: viteConfig }: { port: number, hostname: string, viteConfig?: UserConfig }) {
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
  app.use(cookieParser())
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      let template = readFileSync(join(cwd(), 'index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      
      const generateApp = (await vite.ssrLoadModule(resolve(__dirname, 'vue/index.js'))).generateApp

      const [appHtml, preloadLinks, state, head, teleports, redirect] = await generateApp(url, manifest, req, res, true)

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
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`)
  })
}
