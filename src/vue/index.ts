import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { basename, dirname, resolve, join } from 'node:path'
import { Request, Response } from 'express'
import { type SSRContext, renderToString } from 'vue/server-renderer'
import { vueSSR as vueSSRType } from '../index'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function generateApp(url: string, manifest, req: Request, res: Response, dev = false) {
  let main: ReturnType<typeof vueSSRType>

  // dirty fix
  if (dev) {
    main = (await import(/* @vite-ignore */ join(cwd(), 'src/main.ts'))).default
  } else {
    main = (await import(/* @vite-ignore */ resolve(__dirname, './main.js'))).default
  }

  const { app, router, state } = (await import('./vue')).vueSSR(
    main.App,
    { routes: main.routes },
    main.cb
  )

  await router.push(url)
  await router.isReady()

  const ctx: SSRContext = {}
  const html = await renderToString(app, ctx)

  ctx.req = req
  ctx.res = res

  const preloadLinks = renderPreloadLinks(ctx.modules, manifest)
  return [html, preloadLinks, state]
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
