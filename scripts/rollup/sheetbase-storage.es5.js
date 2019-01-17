import config from './sheetbase';

export default {
    input: './dist/esm5/lib/storage/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-storage.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
