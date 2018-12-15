import resolve from 'rollup-plugin-node-resolve';

export default {
    input: './dist/esm5/sheetbase.js',
    output: [
        {
            file: './dist/fesm5/sheetbase.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/bundles/sheetbase.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: [
        resolve()
    ]
};
