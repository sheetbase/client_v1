import config from './sheetbase';

export default {
    input: './dist/esm5/lib/cache/cache.js',
    output: [
        {
            file: './dist/sheetbase-cache.js',
            format: 'umd',
            sourcemap: true,
            name: 'sheetbase.cache',
            exports: 'default',
        }
    ],
    plugins: config.plugins
};
