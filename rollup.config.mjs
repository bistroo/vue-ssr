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
    input: 'src/plugin.ts',
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
      dir: 'dist',
    },
    plugins: [
      esbuild(),
    ],
  },
  {
    input: 'src/vue.ts',
    external: ['vue', 'vue-router', '@vueuse/head'],
    output: {
      file: 'dist/vue.js',
      format: 'es',
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
    input: 'src/plugin.ts',
    output: {
      file: 'dist/plugin.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        compilerOptions: {
           preserveSymlinks: false
         }
       }),
    ],
  }
]
