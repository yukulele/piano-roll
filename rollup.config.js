import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/scripts/script.ts',
  output: {
    file: 'public/scripts/script.js',
    format: 'iife',
    name: '_',
    sourcemap: 'sourceMap',
  },
  plugins: [typescript({ typescript: require('typescript') })],
}
