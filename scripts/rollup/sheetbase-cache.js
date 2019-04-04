import config from './sheetbase';

export default {
    input: './dist/esm5/lib/storage/storage.js',
    output: [
        {
            file: './dist/sheetbase-storage.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.storage',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
