export default [
  {
    input: 'src/index.js',
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
    output: {
      file: 'plurals.js',
      format: 'esm',
    },
  },
]
