import resolve from 'rollup-plugin-node-resolve';

export default {
    input: './dist/esm2015/public_api.js',
    output: [
        {
            file: './dist/fesm2015/sheetbase-client.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/bundles/sheetbase-client.umd.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: [
        resolve()
    ]
};
