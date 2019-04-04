import config from './sheetbase';

export default {
    input: './dist/esm5/lib/cache/index.js',
    output: [
        {
            file: './dist/fesm5/sheetbase-cache.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: config.plugins
};
