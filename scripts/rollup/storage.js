import config from './sheetbase';

export default {
    input: './dist/esm5/lib/storage/index.js',
    output: [
        {
            file: './dist/storage/storage.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: './dist/storage.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
