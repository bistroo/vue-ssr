import _traverse from '@babel/traverse'
const traverse = _traverse.default
import { parse } from '@babel/parser'
import _generate from '@babel/generator'
const generate = _generate.default
import t from '@babel/types'

export function transformEntrypoint(code: string, ssr: boolean, ssrBuild: boolean) {
  const ast = parse(code, { sourceType: 'module' })

  if (ssr) {
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === 'vite-plugin-vue-ssr') {
          path.node.source.value = 'virtual:ssr-entry-point'
        }
      },
    })
  } else {
    traverse(ast, {
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
                    [ ...path.node.declaration.arguments, t.identifier(ssrBuild ? 'true' : 'false') ]
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
  }

  return {
    code: generate(ast).code,
  }
}
