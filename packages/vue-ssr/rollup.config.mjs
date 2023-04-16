import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'src/index.ts',
    external: ['vue'],
    output: {
      format: 'es',
      file: `dist/index.js`,
    },
    plugins: [
      esbuild(),
    ],
  },
  {
    input: 'src/cli.ts',
    output: {
      format: 'es',
      file: `dist/cli.js`,
    },
    plugins: [
      esbuild(),
    ],
  },
  {
    input: 'src/vue/index.ts',
    output: {
      format: 'es',
      dir: `dist/vue`,
    },
    plugins: [
      esbuild(),
    ],
  },
  // {
  //   input: 'src/index.ts',
  //   // external: ['vue'],
  //   output: {
  //     file: 'dist/index.d.ts',
  //     format: 'es',
  //   },
  //   plugins: [
  //     dts(),
  //   ],
  // }
]
