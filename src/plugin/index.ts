// @ts-nocheck
import { readFileSync } from 'node:fs'
import { cwd } from 'node:process'
import { Plugin } from 'vite'
import { SSRContext, renderToString } from 'vue/server-renderer'
import { load } from 'cheerio'
import devalue from '@nuxt/devalue'
import cookieParser from 'cookie-parser'
import { transformEntrypoint } from './transformEntrypoint'
import type { vueSSR as vueSSRFn } from '../index'

export default function vueSsrPlugin(): Plugin {
  let ssr: boolean | string

  const virtualModuleId = 'virtual:ssr-entry-point'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'vue-ssr',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export function vueSSR(App, { routes, head, scrollBehavior }, cb) {
          return {
            App,
            routes,
            head,
            scrollBehavior,
            cb,
          }
        }`
      }
    },
    config(config, { command }) {
      ssr = config.build?.ssr

      // serve without config.build.ssr is forced into SSR
      // serve with config.build.ssr false is SPA
      if (command === 'serve' && ssr === undefined) {
        config.build = {
          ssr: 'src/main.ts',
        }

        ssr = config.build.ssr
      }

      config.appType = ssr ? 'custom' : 'spa'
    },
    transformIndexHtml() {
      if (ssr) return

      return [
        {
          tag: 'div',
          attrs: {
            id: 'teleports',
          },
          injectTo: 'body',
        }
      ]
    },
    transform(code, id, options) {
      if (id.endsWith('main.ts')) {
        return transformEntrypoint(code, options?.ssr ?? false, !!ssr)
      }
    },
    configureServer(server) {
      if (ssr) {
        return () => {
          server.middlewares.use(cookieParser())
          server.middlewares.use(async (req, res) => {
            const url = req.originalUrl
  
            let template = readFileSync(resolve(cwd(), 'index.html'), 'utf-8')
            template = await server.transformIndexHtml(url!, template)

            const { App, routes, cb }: ReturnType<typeof vueSSRFn> = (await server.ssrLoadModule(resolve(cwd(), ssr))).default

            const { vueSSR } = (await import('./vue'))

            const { app, router, state, head } = vueSSR(App, { routes }, undefined, true, true)

            if (cb !== undefined) {
              cb({ app, router, state, request: req, response: res })
            }

            await router.push(url!)
            await router.isReady()

            let redirect = null

            const ctx: SSRContext = {}
            ctx.request = req
            ctx.response = res
            ctx.redirect = (url: string) => redirect = url
            const html = await renderToString(app, ctx)

            const preloadLinks = renderPreloadLinks(ctx.modules, {})

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

            if (state !== undefined) {
              $('body').append(`<script>window.__INITIAL_STATE__ = ${devalue(state.value)}</script>`)
            }

            const teleports = ctx.teleports ?? {}

            if (teleports['#teleports'] !== undefined) {
              $('body').append(`<div id="teleports">${teleports['#teleports']}</div>`)
            }

            $('head').append(preloadLinks)
            $('#app').html(html)
  
            res.end($.html())
          })
        }
      }
    },
  }
}

function renderPreloadLinks(modules, manifest) {
  let links = ''
  const seen = new Set()
  modules.forEach((id) => {
    const files = manifest[id]
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file)
          const filename = basename(file)
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile)
              seen.add(depFile)
            }
          }
          links += renderPreloadLink(file)
        }
      })
    }
  })
  return links
}

function renderPreloadLink(file) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`
  } else if (file.endsWith('.woff')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`
  } else if (file.endsWith('.woff2')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`
  } else if (file.endsWith('.gif')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`
  } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`
  } else if (file.endsWith('.png')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`
  } else {
    // TODO
    return ''
  }
}
