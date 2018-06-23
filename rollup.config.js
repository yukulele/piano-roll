import typescript from 'rollup-plugin-typescript'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/script.ts',
  output: {
    file: 'www/script.js',
    format: 'esm',
    sourcemap: 'sourceMap'
  },
  plugins: [
    typescript(),
    /* babel({
      exclude: 'node_modules/**'
    }) */
  ]
}
