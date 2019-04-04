import config from './sheetbase';

export default {
    input: './dist/esm5/lib/fetch/fetch.js',
    output: [
        {
            file: './dist/sheetbase-fetch.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.fetch',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
