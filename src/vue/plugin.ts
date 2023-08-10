import { readFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type Plugin } from 'vite'
import _traverse from '@babel/traverse'
const traverse = _traverse.default
import { parse } from '@babel/parser'
import _generate from '@babel/generator'
const generate = _generate.default
import t from '@babel/types'

export function vueSsrPlugin(): Plugin {
  const virtualModuleId = 'virtual:vue-ssr'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  let ssr = true

  return {
    name: 'vite-vue-ssr-plugin',
    config(config) {
      ssr = config.define.__SSR_APP__

      if (!ssr) {
        delete config.build.ssrManifest
        delete config.ssr
      }
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const __dirname = dirname(fileURLToPath(import.meta.url))

        const data = readFileSync(resolve(join(__dirname, 'vue/vue.js')), 'utf8')

        return data
      }
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
      const ssr = options?.ssr ?? false

      if (id.endsWith('main.ts') && ssr === false) {
        const ast = parse(code, { sourceType: 'module' })

        traverse(ast, {
          ImportDeclaration(path) {
            if (path.node.source.value === '@bistroo/vue-ssr') {
              path.node.source.value = 'virtual:vue-ssr'
            }
          },
          ExportDefaultDeclaration(path) {
            path.replaceWithMultiple(
              [
                t.variableDeclaration(
                  'const',
                  [
                    t.variableDeclarator(
                      t.objectPattern([
                        t.objectProperty(
                          t.identifier('app'),
                          t.identifier('app'),
                          false,
                          true
                        ),
                        t.objectProperty(
                          t.identifier('router'),
                          t.identifier('router'),
                          false,
                          true
                        )
                      ]),
                      t.callExpression(
                        t.identifier('vueSSR'),
                        path.node.declaration.arguments
                      )
                    ),
                  ]
                ),
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('router'),
                          t.identifier('isReady')
                        ),
                        []
                      ),
                      t.identifier('then')
                    ),
                    [
                      t.arrowFunctionExpression(
                        [],
                        t.blockStatement(
                          [
                            t.expressionStatement(
                              t.callExpression(
                                t.memberExpression(
                                  t.identifier('app'),
                                  t.identifier('mount')
                                ),
                                [
                                  t.stringLiteral('#app')
                                ]
                              )
                            ),
                            t.expressionStatement(
                              t.callExpression(
                                t.memberExpression(
                                  t.identifier('console'),
                                  t.identifier('log')
                                ),
                                [
                                  t.stringLiteral('hydrated')
                                ]
                              )
                            )
                          ]
                        )
                      )
                    ]
                  )
                )
              ]
            )
          },
        })

        return {
          code: generate(ast).code,
        }
      }
    },
  }
}
