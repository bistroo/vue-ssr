import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

export default [
  {
    input: 'src/index.ts',
    external: ['vue', 'vue-router'],
    output: {
      format: 'es',
      file: `dist/index.js`,
    },
    plugins: [
      esbuild(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        compilerOptions: {
           preserveSymlinks: false
         }
       }),
    ],
  },
  {
    input: 'src/plugin/index.ts',
    external: [
      'vue',
      'vue-router',
      '@vueuse/head',
      'vue/server-renderer',
      'cheerio',
      '@nuxt/devalue',
    ],
    output: {
      format: 'es',
      dir: 'dist/plugin',
    },
    plugins: [
      esbuild(),
    ],
  },
  {
    input: 'src/plugin/index.ts',
    output: {
      file: 'dist/plugin/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        compilerOptions: {
           preserveSymlinks: false
         }
       }),
    ],
  },
  // {
  //   input: 'src/plugin/vue.ts',
  //   external: ['vue', 'vue-router', '@vueuse/head'],
  //   output: {
  //     file: 'dist/plugin/vue.js',
  //     format: 'es',
  //   },
  //   plugins: [
  //     esbuild(),
  //   ],
  // },
]
