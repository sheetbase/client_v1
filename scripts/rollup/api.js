import config from './sheetbase';

export default {
    input: './dist/esm5/lib/api/index.js',
    output: [
        {
            file: './dist/api/api.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/api.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
