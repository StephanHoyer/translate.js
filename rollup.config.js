import buble from '@rollup/plugin-buble'

export default [
  {
    input: 'src/index.js',
    plugins: [buble({ objectAssign: true })],
    output: [
      {
        file: 'common.js',
        format: 'cjs',
      },
      {
        file: 'index.js',
        format: 'esm',
      },
    ],
  },
  {
    input: 'src/plurals.js',
    plugins: [buble({ objectAssign: true })],
    output: {
      file: 'plurals.js',
      format: 'esm',
    },
  },
]
