import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: './dist/esm5/sheetbase.js',
    output: [
        {
            file: './dist/fesm5/sheetbase.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/sheetbase.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: [
        resolve(),
        commonjs({
            namedExports: {
                'node_modules/lscache/lscache.js': ['get', 'set'],
                'node_modules/pubsub-js/src/pubsub.js': ['publish', 'subscribe'],
                'node_modules/localforage/dist/localforage.js': ['getItem', 'setItem', 'removeItem'],
                'node_modules/js-cookie/src/js.cookie.js': ['getJSON', 'set', 'remove']
            }
        })
    ]
};
