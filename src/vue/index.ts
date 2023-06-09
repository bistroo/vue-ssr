import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { basename, dirname, resolve, join } from 'node:path'
import { Request, Response } from 'express'
import { type SSRContext, renderToString } from 'vue/server-renderer'
import { vueSSR as vueSSRType } from '../index'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function generateApp(url: string, manifest: any, req: Request, res: Response, dev = false) {
  let main: ReturnType<typeof vueSSRType>

  // dirty fix
  if (dev) {
    main = (await import(/* @vite-ignore */ join(cwd(), 'src/main.ts'))).default
  } else {
    main = (await import(/* @vite-ignore */ resolve(__dirname, './main.js'))).default
  }

  const { app, router, state, head } = (await import('./vue')).vueSSR(
    main.App,
    { routes: main.routes, head: main.head },
    ({ app, router, state }) => {
      if (main.cb !== undefined) {
        main.cb({ app, router, state, request: req, response: res })
      }
    }
  )

  await router.push(url)
  await router.isReady()

  let redirect = null

  const ctx: SSRContext = {}
  ctx.request = req
  ctx.response = res
  ctx.redirect = (url: string) => redirect = url

  const html = await renderToString(app, ctx)

  const preloadLinks = renderPreloadLinks(ctx.modules, manifest)

  return [html, preloadLinks, state, head, ctx.teleports ?? {}, redirect]
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

function renderPreloadLink(file: string) {
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
