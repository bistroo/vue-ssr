import { fileURLToPath } from 'node:url'
import { cwd } from 'node:process'
import { basename, dirname, resolve as _resolve, join } from 'node:path'
import { type SSRContext, renderToString } from 'vue/server-renderer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const resolve = (p: string) => _resolve(__dirname, p)

export async function render(url: string, manifest, dev = true) {
  let vueSSR

  // dirty fix
  if (dev) {
    vueSSR = (await import(/* @vite-ignore */ join(cwd(), 'src/main.ts'))).default
  } else {
    vueSSR = (await import(/* @vite-ignore */ resolve('./main.js'))).default
  }

  const { app, router } = vueSSR()

  await router.push(url)
  await router.isReady()

  // TODO: add express redirect methods
  const ctx: SSRContext = {}
  const html = await renderToString(app, ctx)

  const preloadLinks = renderPreloadLinks(ctx.modules, manifest)
  return [html, preloadLinks]
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
