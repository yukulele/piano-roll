import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/scripts/script.ts',
  output: {
    file: 'www/scripts/script.js',
    format: 'iife',
    name: 'pianoRoll',
    sourcemap: 'sourceMap',
  },
  plugins: [typescript({ typescript: require('typescript') })],
}
