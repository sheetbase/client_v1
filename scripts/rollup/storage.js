import config from './sheetbase';

export default {
    input: './dist/esm5/lib/storage/index.js',
    output: [
        // {
        //     file: './dist/storage/storage.esm5.js',
        //     format: 'esm',
        //     sourcemap: true
        // },
        {
            file: './dist/sheetbase-storage.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase'
        }
    ],
    plugins: config.plugins
};
