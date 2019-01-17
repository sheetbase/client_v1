import config from './sheetbase';

export default {
    input: './dist/esm5/lib/api/api.js',
    output: [
        {
            file: './dist/sheetbase-api.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.api',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
