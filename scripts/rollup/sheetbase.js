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
                'node_modules/lscache/lscache.min.js': [ 'get', 'set' ]
            }
        })
    ]
};
