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
    external: ['vue', 'vue/server-renderer', 'vue-router'],
    output: {
      format: 'es',
      dir: `dist/vue`,
      chunkFileNames(chunkInfo) {
        return `${chunkInfo.name}.js`
      }
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
  }
]
