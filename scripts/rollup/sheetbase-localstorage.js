import config from './sheetbase';

export default {
    input: './dist/esm5/lib/localstorage/localstorage.js',
    output: [
        {
            file: './dist/sheetbase-localstorage.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.localstorage',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
