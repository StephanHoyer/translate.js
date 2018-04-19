import buble from 'rollup-plugin-buble'

export default {
    input: 'index.js',
    plugins: [ buble() ]
}